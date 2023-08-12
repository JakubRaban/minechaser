from model import Direction
from model.game import ActionType
from services.game import GameService
from socketsetup import sio
from views.helpers import game_state, empty_game_state


def player_action(player_id: str, data: dict):
    game_id = data.pop('gameId', None)
    action_type = data.pop('actionType', None)
    direction = data.pop('direction', None)
    if game_id and action_type in ActionType.__members__.keys() and direction in Direction.__members__.keys():
        action_result = GameService.handle_player_action(player_id, game_id, ActionType[action_type], Direction[direction])
        sio.emit('action_result', action_result, room=game_id)


def get_game_state(player_id, data: dict):
    game = GameService.get(data['gameId'])
    return game_state(game, player_id) if player_id in game.player_id_mapping else empty_game_state()
