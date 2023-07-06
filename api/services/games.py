import random
from typing import List, Dict

from qu.queue_ import Queue
from model.board import standard_defs
from model.game import Game
from model.player import Direction
from responses.lobby import create_public_game


class GameProxy:
    def __init__(self, player_ids: List[str]):
        players_count = len(player_ids)
        self.game = Game(standard_defs['expert' if players_count == 4 else 'intermediate'], players_count)
        self.player_id_mapping = dict(zip(player_ids, self.game.players.colors()))

    def move(self, player_id: str, direction: Direction):
        player = self.player_id_mapping[player_id]
        return self.game.move(player.color, direction)

    def flag(self, player_id: str, direction: Direction):
        player = self.player_id_mapping[player_id]
        return self.game.flag(player.color, direction)


def create_game(player_ids: List[str]):
    game_id = _generate_game_id()
    games[game_id] = GameProxy(player_ids)
    create_public_game(game_id, player_ids)


def _generate_game_id():
    letters = 'bcdfghjklmnpqrstvwxyz'
    return ''.join(random.choice(letters) for _ in range(6))


games: Dict[str, GameProxy] = {}
queue = Queue(players_picked=create_game)
