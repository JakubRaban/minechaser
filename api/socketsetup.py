import random
import string
from datetime import datetime, timezone, timedelta
from functools import wraps
from typing import Optional, Dict

import socketio
from bidict import bidict
from dotenv import find_dotenv, load_dotenv
import ownjson
from scheduler import scheduler

sio = socketio.Server(
    async_mode='gevent',
    cors_allowed_origins=[
        'http://localhost:3000',
        'http://localhost:5000',
        'https://plankton-app-tgr3d.ondigitalocean.app',
        'https://minechaser.com'
    ],
    json=ownjson
)
socket_id_to_player_id = bidict()
player_id_last_seen: Dict[str, datetime] = dict()
player_id_to_player_name: Dict[str, str] = dict()
load_dotenv(find_dotenv('.env.local'))


def remove_stale_players():
    to_remove = []
    for player_id, time in player_id_last_seen.items():
        if datetime.now(timezone.utc) - time > timedelta(days=30):
            to_remove.append(player_id)
    for player_id in to_remove:
        print('removing stale player', player_id)
        player_id_last_seen.pop(player_id)
        socket_id_to_player_id.inverse.pop(player_id)


scheduler.add_job(remove_stale_players, 'interval', days=1)


def with_player_id(func):
    @wraps(func)
    def wrapper(sid, *args):
        if sid in socket_id_to_player_id and socket_id_to_player_id[sid] in player_id_to_player_name:
            return func(socket_id_to_player_id[sid], *args)
        else:
            return None

    return wrapper


import views
import views.admin


@sio.event
def connect(sid, _):
    print('connect ', sid)


@sio.event
def authenticate(sid, data):
    def validate_token(token: Optional[str]):
        return token and token.startswith('dupa') and len(token) == 20

    token = data['token'] \
        if validate_token(data['token']) \
        else f"dupa{''.join([random.choice(string.ascii_letters) for _ in range(16)])}"
    socket_id_to_player_id.forceput(sid, token)
    player_id_last_seen[token] = datetime.now(timezone.utc)
    print(f"Authenticated {sid} as {token}")
    return {'token': token}


@sio.event
def clock_sync(_, data: dict):
    return {**data, 'serverResponseTime': int(datetime.now(timezone.utc).timestamp() * 1000)}


@sio.event
def set_name(sid, data: dict):
    def sanitize_name(name: Optional[str]):
        sanitized_name = ''
        for char in name:
            if len(sanitized_name) < 32 and ord(char) not in range(768, 880):
                sanitized_name += char
        return sanitized_name

    name = data.pop('name', None)
    if isinstance(name, str) and sid in socket_id_to_player_id:
        print('setting name')
        player_id = socket_id_to_player_id[sid]
        sanitized_name = sanitize_name(name)
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
