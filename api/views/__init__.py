from inspect import getmembers, isfunction

from socketsetup import with_player_id

from .lobby import *
from .game import *
from .player import *

modules = [lobby, game, player]

for module in modules:
    for name, func in getmembers(module, isfunction):
        func = sio.event(with_player_id(func))

__all__ = [
    'join_queue',
    'leave_queue',
    'get_game_state',
    'player_action',
    'create_private_game',
    'join_private_game',
    'leave_private_game',
    'start_private_game'
]
