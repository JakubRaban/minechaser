from typing import List
from socketsetup import sio


def create_public_game(game_id: str, socket_ids: List[str]):
    for socket_id in socket_ids:
        sio.enter_room(socket_id, game_id)
    sio.emit('game_joined', {'game_id': game_id}, room=game_id)
