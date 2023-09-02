from typing import List

from model import GameProxy
from queue_ import QueueEntry
from socketsetup import sio, socket_id_to_player_id, player_id_to_player_name
from views.helpers import game_state


class LobbyResponses:
    @staticmethod
    def create_public_game(game: GameProxy, game_id: str, player_ids: List[str]):
        print(f"Response: Creating public game {game_id}")
        for player_id in player_ids:
            socket_id = socket_id_to_player_id.inverse[player_id]
            sio.enter_room(socket_id, game_id)
            sio.emit(
                'public_game_started',
                {'gameId': game_id, **game_state(game, player_id)},
                room=socket_id
            )

    @staticmethod
    def private_game_lobby_update(game: GameProxy, game_id: str, player_id: str):
        print(f"Response: Player {player_id} entered private game {game_id}")
        socket_id = socket_id_to_player_id.inverse[player_id]
        sio.enter_room(socket_id, game_id)
        response = {
            'gameId': game_id,
            'players': [player_id_to_player_name[player_id] for player_id in game.player_ids],
        }
        sio.emit(
            'private_game_lobby_update',
            response,
            room=game_id
        )
        return response

    @staticmethod
    def leave_private_room(game: GameProxy, game_id: str, player_id: str):
        print(f"Response: Leaving private room {game_id}")
        socket_id = socket_id_to_player_id.inverse[player_id]
        sio.leave_room(socket_id, game_id)
        sio.emit(
            'private_game_lobby_update',
            {
                'players': [player_id_to_player_name[player_id] for player_id in game.player_ids],
            },
            room=game_id
        )

    @staticmethod
    def start_private_game(game: GameProxy, game_id: str):
        print(f"Response: Starting private game {game_id}")
        for player_id in game.player_ids:
            socket_id = socket_id_to_player_id.inverse[player_id]
            sio.emit(
                'private_game_started',
                game_state(game, player_id),
                room=socket_id
            )

    @staticmethod
    def start_single_player_game(game: GameProxy, game_id: str, player_id: str):
        print(f"Response: Starting single player game {game_id}")
        socket_id = socket_id_to_player_id.inverse[player_id]
        sio.enter_room(socket_id, game_id)
        sio.emit(
            'single_player_game_started',
            {'gameId': game_id, **game_state(game, player_id)},
            room=socket_id
        )

    @staticmethod
    def update_players_in_queue(queue_state: List[QueueEntry]):
        for socket_id in [socket_id_to_player_id.inverse[entry.player_id] for entry in queue_state]:
            sio.emit(
                'queue_updated',
                {'players': [player_id_to_player_name[entry.player_id] for entry in queue_state]},
                room=socket_id
            )
