from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional

from helpers import generate_game_id
from scheduler import scheduler
from model import Direction
from model.game import GameProxy, ActionType
from queue_ import Queue
from responses.game import GameResponses
from responses.lobby import LobbyResponses
from socketsetup import sio
from types_ import Dimensions


class GameService:
    games: Dict[str, GameProxy] = {}

    @staticmethod
    def create_public_game(player_ids: List[str]):
        game_id = generate_game_id()
        GameService.games[game_id] = GameProxy(
            player_ids,
            on_game_finished=lambda game_proxy: GameResponses.finish_game(game_proxy, game_id),
            on_server_action=lambda cell_update: GameResponses.server_update(game_id, cell_update),
            autostart=True
        )
        LobbyResponses.create_public_game(GameService.games[game_id], game_id, player_ids)

    queue = Queue(players_picked=create_public_game, queue_updated=LobbyResponses.update_players_in_queue)

    @staticmethod
    def create_private_game(player_id: str, single_player: bool = False, restarted_game_id: Optional[str] = None):
        game_id = restarted_game_id or generate_game_id()
        GameService.games[game_id] = GameProxy(
            [player_id],
            on_game_finished=lambda game_proxy: GameResponses.finish_game(game_proxy, game_id),
            on_server_action=lambda cell_update: GameResponses.server_update(game_id, cell_update),
            autostart=single_player
        )
        if single_player:
            LobbyResponses.start_single_player_game(GameService.games[game_id], game_id, player_id)
        else:
            LobbyResponses.private_game_lobby_update(GameService.games[game_id], game_id, player_id, created=True)

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
    def restart_private_game(game_id: str, player_id: str):
        if game_id in GameService.games and player_id in GameService.games[game_id].player_ids:
            game = GameService.games[game_id]
            new_game_id = game.next_game_id
            if new_game_id in GameService.games:
                GameService.join_private_game(new_game_id, player_id)
            else:
                GameService.create_private_game(player_id, restarted_game_id=new_game_id)

    @staticmethod
    def can_connect_to_game(game_id: str, player_id: str):
        return game_id in GameService.games and GameService.games[game_id].has_player(player_id)

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
            if not game.created:
                if not game.full or player_id in game.player_ids:
                    return game
                return {'error': {'code': 'full'}}
            if game.has_player(player_id):
                return game
            return {'error': {'code': 'alien'}}
        return {'error': {'code': 'notFound'}}


def delete_finished_games():
    games_to_delete = []
    for game_id, game in GameService.games.items():
        if game.end_timestamp and datetime.now(timezone.utc) - game.end_timestamp > timedelta(minutes=15):
            games_to_delete.append(game_id)
    for game_id in games_to_delete:
        del GameService.games[game_id]
        sio.close_room(game_id)


scheduler.add_job(delete_finished_games, 'interval', minutes=15)
