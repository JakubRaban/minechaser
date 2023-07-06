import random
import string
from functools import wraps

import socketio
from bidict import bidict

sio = socketio.Server(async_mode='gevent', cors_allowed_origins='*')

socket_id_to_user_id = bidict()


def with_user_id(func):
    @wraps(func)
    def wrapper(sid, *args):
        if sid in socket_id_to_user_id:
            return func(socket_id_to_user_id[sid], *args)
        else:
            return None

    return wrapper


import views.lobby


@sio.event
def connect(sid, environ):
    print('connect ', sid, environ)


@sio.event
def authenticate(sid, data):
    token = data['token'] or f"dupa_{''.join([random.choice(string.ascii_letters) for _ in range(13)])}"
    socket_id_to_user_id.forceput(sid, token)
    print(f"Authenticated {sid} as {token}")
    sio.emit('authenticated', {'token': token}, room=sid)
