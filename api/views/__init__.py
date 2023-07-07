from inspect import getmembers, isfunction

from socketsetup import sio, with_player_id

from .lobby import *
from .game import *

modules = [lobby, game]

for module in modules:
    for name, func in getmembers(module, isfunction):
        func = sio.event(with_player_id(func))

__all__ = ['join_queue', 'leave_queue', 'get_game_state']
