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


class ActionResult:
    def __init__(self, players: Dict[PlayerColor, Player], events: List[GameEvent], mines_left: Optional[int] = None):
        self.players = players
        self.events = events
        self.mines_left = mines_left
        self.end_game_scheduled_timestamp = datetime.now() + timedelta(minutes=1) \
            if any(isinstance(event, MineCellFlagged) for event in events) \
            else None

    def __getstate__(self):
        return {
            'players': {color.name: player for color, player in self.players.items()},
            'cells': [event.cell for event in self.events],
            'minesLeft': self.mines_left,
            'endGameScheduledTimestamp': self.end_game_scheduled_timestamp
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
                return ActionResult(self.players[player_color, ], events, self.board.mines_left)
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
        self.game = Game(standard_defs['expert'], len(player_ids))
        self.player_id_mapping = dict(zip(player_ids, self.game.players.colors()))
        self.start_timestamp = datetime.now() + timedelta(seconds=6)
        self.end_timestamp = None
        self.on_game_finished = on_game_finished
        self.end_game_scheduler = EndGameScheduler(self._finish_game)

    def is_started(self):
        return datetime.now() >= self.start_timestamp

    def is_finished(self):
        return bool(self.end_timestamp)

    def step(self, player_id: str, direction: Direction):
        if self._allow_action(player_id):
            player_color = self.player_id_mapping[player_id]
            result = self.game.step(player_color, direction)
            if result:
                for event in result.events:
                    if isinstance(event, MineCellStepped) and self._all_players_dead():
                        self._finish_game()
                        return
                return result

    def flag(self, player_id: str, direction: Direction):
        if self._allow_action(player_id):
            player_color = self.player_id_mapping[player_id]
            result = self.game.flag(player_color, direction)
            if result:
                for event in result.events:
                    if isinstance(event, NoMinesLeft):
                        self._finish_game()
                        return
                    if isinstance(event, MineCellFlagged):
                        self.end_game_scheduler.postpone_end(result.end_game_scheduled_timestamp)
                return result

    def _allow_action(self, player_id: str):
        return player_id in self.player_id_mapping and self.is_started() and not self.is_finished()

    def _all_players_dead(self):
        return all(not player.alive for player in self.game.players.values())

    def _finish_game(self):
        self.end_timestamp = datetime.now()
        self.game.board.show_pristine_cells()
        self.on_game_finished(self)

    def __getstate__(self):
        base_state = {k: v for k, v in self.__dict__.items() if k in ['game', 'start_timestamp', 'end_timestamp']}
        return {**base_state, 'endGameScheduledTimestamp': self.end_game_scheduler.end_game_scheduled_timestamp}


class EndGameScheduler:
    def __init__(self, on_game_finished: callable):
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.finish_game_job = self.scheduler.add_job(
            on_game_finished, 'date', id='end_game', run_date=datetime.now() + timedelta(minutes=15), args=[]
        )
        self.end_game_scheduled_timestamp = None

    def postpone_end(self, end_game_scheduled_timestamp: datetime):
        self.end_game_scheduled_timestamp = end_game_scheduled_timestamp
        self.finish_game_job = self.scheduler.reschedule_job(
            'end_game', trigger='date', run_date=end_game_scheduled_timestamp
        )

    def __del__(self):
        self.scheduler.shutdown()
