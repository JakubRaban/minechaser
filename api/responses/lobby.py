from typing import List

from model import GameProxy
from socketsetup import sio, socket_id_to_player_id


def create_public_game(game: GameProxy, game_id: str, player_ids: List[str]):
    print(f"Response: Creating public game {game_id}")
    for player_id in player_ids:
        socket_id = socket_id_to_player_id.inverse[player_id]
        sio.enter_room(socket_id, game_id)
        sio.emit(
            'game_joined',
            {'gameId': game_id, 'gameState': game, 'playerColor': game.player_id_mapping[player_id]},
            room=socket_id
        )
