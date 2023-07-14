import random
from datetime import datetime, timedelta
from typing import List, Dict

from apscheduler.schedulers.background import BackgroundScheduler

from model import Direction
from model.game import GameProxy, ActionType
from queue_ import Queue
from responses.game import finish_game
from responses.lobby import create_public_game


def create_game(player_ids: List[str]):
    game_id = _generate_game_id()
    games[game_id] = GameProxy(player_ids, on_game_finished=lambda game_proxy: finish_game(game_proxy, game_id))
    create_public_game(games[game_id], game_id, player_ids)


def _generate_game_id():
    letters = 'bcdfghjklmnpqrstvwxyz'
    return ''.join(random.choice(letters) for _ in range(6))


def handle_player_action(player_id: str, game_id: str, action_type: ActionType, direction: Direction):
    if game_id in games:
        game = games[game_id]
        if action_type == ActionType.STEP:
            return game.step(player_id, direction)
        elif action_type == ActionType.FLAG:
            return game.flag(player_id, direction)


def delete_finished_games():
    games_to_delete = []
    for game_id, game in games.items():
        if game.end_timestamp and datetime.now() - game.end_timestamp > timedelta(minutes=15):
            games_to_delete.append(game_id)
    for game_id in games_to_delete:
        del games[game_id]


games: Dict[str, GameProxy] = {}
queue = Queue(players_picked=create_game)

game_deleting_scheduler = BackgroundScheduler()
game_deleting_scheduler.start()
game_deleting_scheduler.add_job(delete_finished_games, 'interval', minutes=15)
