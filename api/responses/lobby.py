from typing import List

from flask_socketio import join_room, emit


def create_public_game(game_id: str, socket_ids: List[str]):
    for socket_id in socket_ids:
        join_room(game_id, socket_id)
    emit('game_joined', {'game_id': game_id}, room=game_id)
