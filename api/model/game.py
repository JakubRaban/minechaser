from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List

from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BackgroundScheduler

from model.events import GameEvent, MineCellFlagged, NoMinesLeft
from model.player import Players, PlayerColor, Direction, Player
from model.board import Board, BoardDef, standard_defs


@dataclass
class ActionResult:
    player: Player
    events: List[GameEvent]


class Game:
    def __init__(self, board_def: BoardDef, players_count: int):
        self.board = Board(board_def)
        starting_positions = self.board.corners[:players_count]
        self.players = Players(starting_positions)
        for player in self.players.values():
            self.board.step(player.position)

    def move(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        new_position = player.calculate_new_position(direction)
        if new_position not in self.players.positions:
            player.position = new_position
            events = self.board.step(new_position)
            player.process_events(events)
            return ActionResult(player, events)
        return ActionResult(player, [])

    def flag(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        new_position = player.calculate_new_position(direction)
        if new_position not in self.players.positions:
            events = self.board.flag(new_position, player_color)
            player.process_events(events)
            return ActionResult(player, events)
        return ActionResult(player, [])


class GameProxy:
    def __init__(self, player_ids: List[str], on_game_finished: callable):
        players_count = len(player_ids)
        self.game = Game(standard_defs['expert' if players_count == 4 else 'intermediate'], players_count)
        self.player_id_mapping = dict(zip(player_ids, self.game.players.colors()))
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()
        self.is_finished = False
        self.finish_game_job = None
        self.on_game_finished = on_game_finished

    def move(self, player_id: str, direction: Direction):
        if not self.is_finished and player_id in self.player_id_mapping:
            player = self.player_id_mapping[player_id]
            return self.game.move(player.color, direction)

    def flag(self, player_id: str, direction: Direction):
        if not self.is_finished and player_id in self.player_id_mapping:
            player = self.player_id_mapping[player_id]
            result = self.game.flag(player.color, direction)
            for event in result.events:
                if isinstance(event, MineCellFlagged):
                    self.reschedule_end_game()
                if isinstance(event, NoMinesLeft):
                    self.finish_game()
            return result

    def reschedule_end_game(self):
        try:
            self.scheduler.remove_job(self.finish_game_job.id)
        except (JobLookupError, AttributeError):
            pass
        self.finish_game_job = self.scheduler.add_job(
            self.on_game_finished, "date", run_date=datetime.now() + timedelta(minutes=1), args=[]
        )

    def finish_game(self):
        self.is_finished = True
        self.scheduler.shutdown()
        self.on_game_finished()

    def __getstate__(self):
        state = self.__dict__.copy()
        del state['scheduler'], state['finish_game_job'], state['on_game_finished']
        return state
