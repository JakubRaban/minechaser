import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict

from apscheduler.schedulers.background import BackgroundScheduler

from model import Direction
from model.game import GameProxy, ActionType
from queue_ import Queue
from responses.game import GameResponses
from responses.lobby import LobbyResponses
from types_ import Dimensions


class GameService:
    games: Dict[str, GameProxy] = {}

    @staticmethod
    def create_public_game(player_ids: List[str]):
        game_id = _generate_game_id()
        GameService.games[game_id] = GameProxy(
            player_ids,
            on_game_finished=lambda game_proxy: GameResponses.finish_game(game_proxy, game_id),
            autostart=True
        )
        LobbyResponses.create_public_game(GameService.games[game_id], game_id, player_ids)

    queue = Queue(players_picked=create_public_game, queue_updated=LobbyResponses.update_players_in_queue)

    @staticmethod
    def create_private_game(player_id: str, single_player: bool = False):
        game_id = _generate_game_id()
        GameService.games[game_id] = GameProxy(
            [player_id],
            on_game_finished=lambda game_proxy: GameResponses.finish_game(game_proxy, game_id),
            autostart=single_player
        )
        if single_player:
            LobbyResponses.start_single_player_game(GameService.games[game_id], game_id, player_id)
        else:
            LobbyResponses.private_game_lobby_update(GameService.games[game_id], game_id, player_id)

    @staticmethod
    def join_private_game(game_id: str, player_id: str):
        if game_id in GameService.games:
            game = GameService.games[game_id]
            if game.add_player(player_id):
                return LobbyResponses.private_game_lobby_update(game, game_id, player_id)
            else:
                return {'error': {'code': 'full'}}

    @staticmethod
    def leave_private_game(game_id: str, player_id: str):
        if game_id in GameService.games:
            game = GameService.games[game_id]
            game.remove_player(player_id)
            LobbyResponses.leave_private_room(game, game_id, player_id)

    @staticmethod
    def start_private_game(game_id: str, player_id: str, size: Dimensions):
        if game_id in GameService.games and player_id in GameService.games[game_id].player_ids:
            game = GameService.games[game_id]
            game.start_game(size)
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
    def get_state(game_id: str, player_id: str):
        if game_id in GameService.games:
            game = GameService.games[game_id]
            if not game.created():
                if not game.full:
                    return game
                else:
                    return {'error': {'code': 'full'}}
            if player_id in game.player_id_mapping:
                return game
            return {'error': {'code': 'alien'}}
        else:
            return {'error': {'code': 'notFound'}}


def _generate_game_id():
    letters = 'bcdfghjklmnpqrstvxz'
    return ''.join(random.choice(letters) for _ in range(8))


def delete_finished_games():
    games_to_delete = []
    for game_id, game in GameService.games.items():
        if game.end_timestamp and datetime.now(timezone.utc) - game.end_timestamp > timedelta(minutes=15):
            games_to_delete.append(game_id)
    for game_id in games_to_delete:
        del GameService.games[game_id]


game_deleting_scheduler = BackgroundScheduler()
game_deleting_scheduler.start()
game_deleting_scheduler.add_job(delete_finished_games, 'interval', minutes=15)
