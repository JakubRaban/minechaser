import copy

from services.games import games


def get_game_state(player_id, data):
    game = copy.copy(games[data['gameId']])
    if player_id in game.player_id_mapping:
        game.player_id_mapping = {id_: color for id_, color in game.player_id_mapping.items() if id_ == player_id}
        return game
