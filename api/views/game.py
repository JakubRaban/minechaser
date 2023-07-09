import copy

from services.games import games


def get_game_state(player_id, data):
    game = games[data['gameId']]
    return {'gameState': game, 'playerColor': game.player_id_mapping[player_id]}
