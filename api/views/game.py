import time

from model import Direction
from model.game import ActionType
from services.game import games, handle_player_action
from socketsetup import sio


def player_action(player_id: str, data: dict):
    game_id = data.pop('gameId', None)
    action_type = data.pop('actionType', None)
    direction = data.pop('direction', None)
    if game_id and action_type in ActionType.__members__.keys() and direction in Direction.__members__.keys():
        action_result = handle_player_action(player_id, game_id, ActionType[action_type], Direction[direction])
        sio.emit('action_result', action_result, room=game_id)


def get_game_state(player_id, data: dict):
    game = games[data['gameId']]
    if player_id in game.player_id_mapping:
        return {'gameState': game, 'playerColor': game.player_id_mapping[player_id]}
    else:
        return {'gameState': None, 'playerColor': None}
