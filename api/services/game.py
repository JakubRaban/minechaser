import random
from datetime import datetime, timedelta
from typing import List, Dict

from apscheduler.schedulers.background import BackgroundScheduler

from model import Direction, standard_defs
from model.game import GameProxy, ActionType
from queue_ import Queue
from responses.game import GameResponses
from responses.lobby import LobbyResponses


class GameService:
    games: Dict[str, GameProxy] = {}

    @staticmethod
    def create_public_game(player_ids: List[str]):
        game_id = _generate_game_id()
        GameService.games[game_id] = GameProxy(
            player_ids,
            standard_defs['expert'],
            on_game_finished=lambda game_proxy: GameResponses.finish_game(game_proxy, game_id),
            autostart=True
        )
        LobbyResponses.create_public_game(GameService.games[game_id], game_id, player_ids)

    queue = Queue(players_picked=create_public_game)

    @staticmethod
    def create_private_game(player_id: str):
        game_id = _generate_game_id()
        GameService.games[game_id] = GameProxy(
            [player_id],
            standard_defs['expert'],
            on_game_finished=lambda game_proxy: GameResponses.finish_game(game_proxy, game_id),
            autostart=False
        )
        LobbyResponses.enter_private_game(GameService.games[game_id], game_id, player_id)

    @staticmethod
    def join_private_game(game_id: str, player_id: str):
        if game_id in GameService.games:
            game = GameService.games[game_id]
            game.add_player(player_id)
            return LobbyResponses.enter_private_game(game, game_id, player_id)

    @staticmethod
    def leave_private_game(game_id: str, player_id: str):
        if game_id in GameService.games:
            game = GameService.games[game_id]
            game.remove_player(player_id)
            LobbyResponses.leave_private_room(game, game_id, player_id)

    @staticmethod
    def start_private_game(game_id: str, player_id: str):
        if game_id in GameService.games and player_id in GameService.games[game_id].player_ids:
            game = GameService.games[game_id]
            game.start_game(standard_defs['expert'])
            LobbyResponses.start_private_game(game, game_id)

    @staticmethod
    def add_player_to_queue(player_id: str):
        GameService.queue.add_player(player_id)

    @staticmethod
    def remove_player_from_queue(player_id: str):
        GameService.queue.remove_player(player_id)

    @staticmethod
    def handle_player_action(player_id: str, game_id: str, action_type: ActionType, direction: Direction):
        if game_id in GameService.games:
            game = GameService.games[game_id]
            if action_type == ActionType.STEP:
                return game.step(player_id, direction)
            elif action_type == ActionType.FLAG:
                return game.flag(player_id, direction)

    @staticmethod
    def get(game_id: str):
        return GameService.games[game_id]


def _generate_game_id():
    letters = 'bcdfghjklmnpqrstvwxyz'
    return ''.join(random.choice(letters) for _ in range(6))


def delete_finished_games():
    games_to_delete = []
    for game_id, game in GameService.games.items():
        if game.end_timestamp and datetime.now() - game.end_timestamp > timedelta(minutes=15):
            games_to_delete.append(game_id)
    for game_id in games_to_delete:
        del GameService.games[game_id]


game_deleting_scheduler = BackgroundScheduler()
game_deleting_scheduler.start()
game_deleting_scheduler.add_job(delete_finished_games, 'interval', minutes=15)
