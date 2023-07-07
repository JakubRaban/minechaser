import random
from typing import List, Dict

from model.game import GameProxy
from qu.queue_ import Queue
from responses.game import end_game
from responses.lobby import create_public_game


def create_game(player_ids: List[str]):
    game_id = _generate_game_id()
    games[game_id] = GameProxy(player_ids, on_game_finished=end_game)
    create_public_game(game_id, player_ids)


def _generate_game_id():
    letters = 'bcdfghjklmnpqrstvwxyz'
    return ''.join(random.choice(letters) for _ in range(6))


games: Dict[str, GameProxy] = {}
queue = Queue(players_picked=create_game)
