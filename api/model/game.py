import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from enum import Enum
from functools import wraps
from threading import RLock
from typing import List, Optional, Callable

from apscheduler.jobstores.base import JobLookupError

from helpers import generate_game_id
from scheduler import scheduler
from model.cell import Cell
from model.events import MineCellFlagged, NoMinesLeft, MineCellStepped, ActionOutcome
from model.player import Players, PlayerColor, Direction, Player
from model.board import Board
from types_ import Dimensions, Position


class ActionType(Enum):
    STEP = 'step'
    FLAG = 'flag'
    BONUS_PLACED = 'bonus_placed'
    NOOP = 'noop'


class ActionResult:
    def __init__(
        self,
        originator: Player,
        originator_color: PlayerColor,
        action_type: ActionType,
        position: Optional[Position] = None,
        outcome: Optional[ActionOutcome] = None,
        mines_left: Optional[int] = None
    ):
        self.originator_color = originator_color
        self.players = {originator_color: originator}
        self.outcome = outcome
        self.points_change = outcome.points_change if outcome else 0
        self.mines_left = mines_left
        self.action_type = action_type
        self.position = position
        self.end_game_scheduled_timestamp = None

    def __getstate__(self):
        full_result = {
            'originatorColor': self.originator_color.name,
            'players': {color.name: player for color, player in self.players.items()},
            'cells': [cell for cell in self.outcome.cells] if self.outcome else [],
            'events': [event.__name__ for event in self.outcome.event_types] if self.outcome else [],
            'pointsChange': self.points_change,
            'minesLeft': self.mines_left,
            'endGameScheduledTimestamp': self.end_game_scheduled_timestamp
        }
        return {k: v for k, v in full_result.items() if v or k == 'minesLeft'}


@dataclass
class CellUpdate:
    cells: List[Cell]


class Game:
    def __init__(self, dimensions: Dimensions, players_count: int, on_server_action: Callable[[CellUpdate | ActionResult], None], generate_bonuses: bool):
        def on_bonus_added(cell: Cell):
            self.on_server_action(CellUpdate([cell]))

        self.board = Board(dimensions, on_bonus_added if generate_bonuses else None)
        starting_positions = self.board.corners[:players_count]
        self.players = Players(starting_positions)
        self.on_server_action = on_server_action
        for player in self.players.values():
            self.board.step(player.position)

    def step(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        if player.alive:
            new_position = self.board.normalize_position(player.calculate_new_position(direction))
            if not self.board.cells[new_position].flagging_player:
                outcome = self.board.step(new_position)
                player.position = new_position
                if outcome.bonus:
                    player.add_bonus(outcome.bonus, lambda p: self._on_bonus_expired(p))
                player.process_outcome(outcome)
                return ActionResult(player, player_color, ActionType.STEP, new_position, outcome, self.board.mines_left)
            return ActionResult(player, player_color, ActionType.NOOP, player.position, ActionOutcome())

    def flag(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        if player.alive:
            new_position = player.calculate_new_position(direction)
            if new_position not in self.players.positions and new_position in self.board.cells:
                outcome = self.board.flag(new_position, player_color)
                if outcome.bonus:
                    player.add_bonus(outcome.bonus, lambda p: self._on_bonus_expired(p))
                player.process_outcome(outcome)
                return ActionResult(player, player_color, ActionType.FLAG, new_position, outcome, self.board.mines_left)
            return ActionResult(player, player_color, ActionType.NOOP, new_position, ActionOutcome())

    def _on_bonus_expired(self, player):
        self.on_server_action(ActionResult(player, player.color, ActionType.NOOP))


class GameProxy:
    def __init__(self, player_ids: List[str], on_game_finished: callable, on_server_action: Callable[[CellUpdate | ActionResult], None], autostart: bool):
        is_public = autostart and len(player_ids) > 1
        self.is_private = not autostart and len(player_ids) == 1
        self.is_single_player = autostart and len(player_ids) == 1
        time_before_start = 9 if is_public else 4

        self.game = Game((18, 27), len(player_ids), on_server_action, not self.is_single_player) if autostart else None
        self.start_timestamp = datetime.now(timezone.utc) + timedelta(seconds=time_before_start) if autostart else None
        self.players = dict(zip(player_ids, self.game.players.colors() if autostart else [None] * 4))
        self.end_timestamp = None
        self.end_game_scheduler = EndGameScheduler(self._finish_game, autostart=autostart, single_player=self.is_single_player)

        self.lock = RLock()
        self.is_started = autostart
        self.next_game_id = generate_game_id() if self.is_private else None
        self.on_server_action = on_server_action
        self.on_game_finished = on_game_finished

    def locked(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            with self.lock:
                return func(self, *args, **kwargs)
        return wrapper

    @locked
    def add_player(self, player_id: str):
        if not self.full and player_id not in self.players and not self.created:
            self.players[player_id] = None
            return True
        return False

    @locked
    def remove_player(self, player_id: str):
        if player_id in self.players and not self.created:
            self.players.pop(player_id)

    @locked
    def has_player(self, player_id: str):
        return player_id in self.player_ids if self.players else player_id in self.players

    @property
    def full(self):
        return len(self.players) == 4

    @locked
    def start_game(self, dimensions: Dimensions):
        if not self.game:
            self.is_started = True
            self.start_timestamp = datetime.now(timezone.utc) + timedelta(seconds=6)
            self.game = Game(dimensions, len(self.players), self.on_server_action, not self.is_single_player)
            self.end_game_scheduler.start()
            for player, color in zip(self.player_ids, self.game.players.colors()):
                self.players[player] = color

    @property
    def created(self):
        return self.game is not None

    @property
    def is_finished(self):
        return bool(self.end_timestamp)

    @locked
    def step(self, player_id: str, direction: Direction):
        if self._allow_action(player_id):
            player_color = self.players[player_id]
            result = self.game.step(player_color, direction)
            if result:
                for event_type in result.outcome.event_types:
                    if event_type == MineCellStepped and self._all_players_dead():
                        self.end_game_scheduler.finish_now()
                return result

    @locked
    def flag(self, player_id: str, direction: Direction):
        if self._allow_action(player_id):
            player_color = self.players[player_id]
            result = self.game.flag(player_color, direction)
            if result:
                for event_type in result.outcome.event_types:
                    if event_type == NoMinesLeft:
                        self._finish_game()
                        return
                    if event_type == MineCellFlagged and len(self.players) > 1:
                        result.end_game_scheduled_timestamp = datetime.now(timezone.utc) + timedelta(minutes=2)
                        self.end_game_scheduler.postpone_end(result.end_game_scheduled_timestamp)
                return result

    @property
    def player_ids(self):
        return self.players.keys()

    def _allow_action(self, player_id: str):
        return player_id in self.players and self.is_started and not self.is_finished

    def _all_players_dead(self):
        return all(not player.alive for player in self.game.players.values())

    @locked
    def _finish_game(self):
        if self.game is not None:
            self.game.board.show_pristine_cells()
        self.end_timestamp = datetime.now(timezone.utc)
        self.end_game_scheduler.stop()
        if hasattr(self.game.board, 'bonus_generator'):
            self.game.board.bonus_generator.stop()
        self.on_game_finished(self)

    def __getstate__(self):
        base_state = {k: v for k, v in self.__dict__.items() if k in ['game', 'start_timestamp', 'end_timestamp', 'is_private']}
        return {
            **base_state,
            'endGameScheduledTimestamp': self.end_game_scheduler.end_game_scheduled_timestamp
        }


class EndGameScheduler:
    def __init__(self, on_game_finished: callable, autostart=True, single_player=False):
        self.on_game_finished = on_game_finished
        self.finish_game_job = None
        self.random_id = None
        self.single_player = single_player
        self.end_game_scheduled_timestamp = None
        if autostart:
            self.start()

    def start(self):
        if not self.started:
            self.end_game_scheduled_timestamp = datetime.now(timezone.utc) + timedelta(hours=1)
            self.random_id = f'end_game-{str(uuid.uuid4())}'
            self.finish_game_job = scheduler.add_job(
                self.on_game_finished, 'date', id=self.random_id, run_date=self.end_game_scheduled_timestamp, args=[]
            )

    @property
    def started(self):
        return bool(self.random_id)

    def postpone_end(self, end_game_scheduled_timestamp: datetime):
        if not self.single_player:
            self.end_game_scheduled_timestamp = end_game_scheduled_timestamp
            self.finish_game_job = scheduler.reschedule_job(
                self.random_id, trigger='date', run_date=end_game_scheduled_timestamp
            )

    def finish_now(self):
        self.finish_game_job = scheduler.reschedule_job(
            self.random_id, trigger='date', run_date=datetime.now(timezone.utc)
        )

    def stop(self):
        try:
            scheduler.remove_job(self.random_id)
        except JobLookupError:
            pass
