from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import List, Dict, Optional

from apscheduler.schedulers.background import BackgroundScheduler

from model.events import GameEvent, MineCellFlagged, NoMinesLeft, MineCellStepped
from model.player import Players, PlayerColor, Direction, Player
from model.board import Board, BoardDef, standard_defs


class ActionType(Enum):
    STEP = 'step'
    FLAG = 'flag'


@dataclass
class ActionResult:
    players: Dict[PlayerColor, Player]
    events: List[GameEvent]
    mines_left: Optional[int] = None

    def __getstate__(self):
        return {
            'players': {color.name: player for color, player in self.players.items()},
            'cells': [event.cell for event in self.events],
            'minesLeft': self.mines_left
        }


class Game:
    def __init__(self, board_def: BoardDef, players_count: int):
        self.board = Board(board_def)
        starting_positions = self.board.corners[:players_count]
        self.players = Players(starting_positions)
        for player in self.players.values():
            self.board.step(player.position)

    def step(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        if player.alive:
            new_position = self.board.normalize_position(player.calculate_new_position(direction))
            if new_position not in self.players.positions:
                events = self.board.step(new_position)
                player.position = new_position
                player.process_events(events)
                return ActionResult(self.players[player_color, ], events)
            return ActionResult(self.players[player_color, ], [])

    def flag(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        if player.alive:
            new_position = self.board.normalize_position(player.calculate_new_position(direction))
            if new_position not in self.players.positions:
                events = self.board.flag(new_position, player_color)
                player.process_events(events)
                return ActionResult(self.players[player_color, ], events, self.board.mines_left)
            return ActionResult(self.players[player_color, ], [])


class GameProxy:
    def __init__(self, player_ids: List[str], on_game_finished: callable):
        players_count = len(player_ids)
        self.game = Game(standard_defs['expert'], players_count)
        self.player_id_mapping = dict(zip(player_ids, self.game.players.colors()))
        self.start_timestamp = datetime.now() + timedelta(seconds=6)
        self.end_timestamp = None
        self.on_game_finished = on_game_finished
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.finish_game_job = self.scheduler.add_job(
            self._finish_game, 'date', id='end_game', run_date=datetime.now() + timedelta(minutes=15), args=[]
        )

    def is_started(self):
        return datetime.now() >= self.start_timestamp

    def is_finished(self):
        return bool(self.end_timestamp)

    def step(self, player_id: str, direction: Direction):
        if self._allow_action(player_id):
            player_color = self.player_id_mapping[player_id]
            result = self.game.step(player_color, direction)
            for event in result.events:
                if isinstance(event, MineCellStepped):
                    self._finish_if_all_players_dead()
            return result

    def flag(self, player_id: str, direction: Direction):
        if self._allow_action(player_id):
            player_color = self.player_id_mapping[player_id]
            result = self.game.flag(player_color, direction)
            for event in result.events:
                if isinstance(event, NoMinesLeft):
                    self._finish_game()
                if isinstance(event, MineCellFlagged):
                    self._reschedule_end_game()
            return result

    def _allow_action(self, player_id: str):
        return player_id in self.player_id_mapping and self.is_started() and not self.is_finished()

    def _reschedule_end_game(self):
        self.finish_game_job = self.scheduler.reschedule_job(
            'end_game', trigger='date', run_date=datetime.now() + timedelta(minutes=15)
        )

    def _finish_if_all_players_dead(self):
        if all(not player.alive for player in self.game.players.values()):
            self._finish_game()

    def _finish_game(self):
        self.end_timestamp = datetime.now()
        self.on_game_finished(self)

    def __del__(self):
        self.scheduler.shutdown()

    def __getstate__(self):
        return {k: v for k, v in self.__dict__.items() if k in ['game', 'start_timestamp', 'end_timestamp']}
