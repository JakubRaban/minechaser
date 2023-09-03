import random
import string
from functools import wraps

import socketio
from bidict import bidict
import jsonpickle


def jsonpickle_dumps(value, *args, **kwargs):
    return jsonpickle.encode(value, unpicklable=False, *args, **kwargs)


jsonpickle.dumps = jsonpickle_dumps
sio = socketio.Server(async_mode='gevent', cors_allowed_origins='*', json=jsonpickle)
socket_id_to_player_id = bidict()
player_id_to_player_name = dict()


def with_player_id(func):
    @wraps(func)
    def wrapper(sid, *args):
        if sid in socket_id_to_player_id and socket_id_to_player_id[sid] in player_id_to_player_name:
            return func(socket_id_to_player_id[sid], *args)
        else:
            return None

    return wrapper


import views


@sio.event
def connect(sid, _):
    print('connect ', sid)


@sio.event
def authenticate(sid, data):
    token = data['token'] or f"dupa{''.join([random.choice(string.ascii_letters) for _ in range(13)])}"
    socket_id_to_player_id.forceput(sid, token)
    print(f"Authenticated {sid} as {token}")
    return {'token': token}


@sio.event
def set_name(sid, data: dict):
    name = data.pop('name', None)
    if isinstance(name, str) and sid in socket_id_to_player_id:
        print('setting name')
        player_id = socket_id_to_player_id[sid]
        sanitized_name = ' '.join(name.split())[:32].lower()
        if len(sanitized_name) >= 3:
            player_id_to_player_name[player_id] = sanitized_name
            return {'name': sanitized_name}


@sio.event
def is_name_set(sid, _):
    if sid in socket_id_to_player_id:
        player_id = socket_id_to_player_id[sid]
        return {'name': player_id_to_player_name.get(player_id, None)}
    else:
        return {'name': None}
