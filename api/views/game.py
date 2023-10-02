from model import Direction
from model.game import ActionType, GameProxy
from services.game import GameService
from socketsetup import sio, socket_id_to_player_id
from views.helpers import game_state


def game_connect(player_id: str, data: dict):
    game_id = data.pop('gameId', None)
    if game_id and GameService.can_connect_to_game(game_id, player_id):
        sio.enter_room(socket_id_to_player_id.inverse[player_id], game_id)


def game_disconnect(player_id, data: dict):
    game_id = data.pop('gameId', None)
    sio.leave_room(socket_id_to_player_id.inverse[player_id], game_id)


def player_action(player_id: str, data: dict):
    game_id = data.pop('gameId', None)
    action_type = data.pop('actionType', None)
    direction = data.pop('direction', None)
    if game_id and action_type in ActionType.__members__.keys() and direction in Direction.__members__.keys():
        action_result = GameService.handle_player_action(player_id, game_id, ActionType[action_type], Direction[direction])
        sio.emit('action_result', action_result, room=game_id)


def get_game_state(player_id, data: dict):
    game_or_error = GameService.get_state(data['gameId'], player_id)
    if isinstance(game_or_error, GameProxy):
        return game_state(game_or_error, player_id)
    return game_or_error


def restart_game(player_id, data: dict):
    game_id = data.pop('gameId', None)
    if game_id:
        return GameService.restart_private_game(game_id, player_id)
