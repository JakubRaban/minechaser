import random
from datetime import datetime, timedelta
from typing import List, Dict

from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BackgroundScheduler

from model.events import MineCellFlagged, NoMinesLeft
from qu.queue_ import Queue
from model.board import standard_defs
from model.game import Game
from model.player import Direction
from responses.game import end_game
from responses.lobby import create_public_game


class GameProxy:
    def __init__(self, player_ids: List[str], on_game_finished: callable):
        players_count = len(player_ids)
        self.game = Game(standard_defs['expert' if players_count == 4 else 'intermediate'], players_count)
        self.player_id_mapping = dict(zip(player_ids, self.game.players.colors()))
        self.scheduler = BackgroundScheduler()
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


def create_game(player_ids: List[str]):
    game_id = _generate_game_id()
    games[game_id] = GameProxy(player_ids, on_game_finished=end_game)
    create_public_game(game_id, player_ids)


def _generate_game_id():
    letters = 'bcdfghjklmnpqrstvwxyz'
    return ''.join(random.choice(letters) for _ in range(6))


games: Dict[str, GameProxy] = {}
queue = Queue(players_picked=create_game)
