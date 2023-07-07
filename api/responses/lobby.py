from typing import List

from socketsetup import sio, socket_id_to_player_id


def create_public_game(game_id: str, player_ids: List[str]):
    print(f"Response: Creating public game {game_id}")
    for player_id in player_ids:
        sio.enter_room(socket_id_to_player_id.inverse[player_id], game_id)
    sio.emit('game_joined', {'game_id': game_id}, room=game_id)
