import random
import string
from functools import wraps

import socketio
from bidict import bidict
import jsonpickle
import humps


def t_dict(d):
    if isinstance(d, list):
        return [t_dict(i) if isinstance(i, (dict, list)) or hasattr(i, '__dict__') else i for i in d]
    if hasattr(d, '__dict__'):
        return t_dict(d.__getstate__ if hasattr(d, '__getstate__') else d.__dict__)
    return {humps.camelize(a): t_dict(b) if isinstance(b, (dict, list)) or hasattr(b, '__dict__') else b for a, b in d.items()}


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
    token = data['token'] or f"dupa{''.join([random.choice(string.ascii_letters) for _ in range(13)])}"
    socket_id_to_player_id.forceput(sid, token)
    print(f"Authenticated {sid} as {token}")
    sio.emit('authenticated', {'token': token}, room=sid)
