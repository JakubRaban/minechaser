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


def with_player_id(func):
    @wraps(func)
    def wrapper(sid, *args):
        if sid in socket_id_to_player_id:
            return func(socket_id_to_player_id[sid], *args)
        else:
            return None

    return wrapper


import views


@sio.event
def connect(sid, environ):
    print('connect ', sid)


@sio.event
def authenticate(sid, data):
    token = data['token'] or f"dupa_{''.join([random.choice(string.ascii_letters) for _ in range(13)])}"
    socket_id_to_player_id.forceput(sid, token)
    print(f"Authenticated {sid} as {token}")
    sio.emit('authenticated', {'token': token}, room=sid)
