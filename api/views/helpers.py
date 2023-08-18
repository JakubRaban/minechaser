from model import GameProxy
from socketsetup import player_id_to_player_name


def game_state(game: GameProxy, player_id: str):
    return {
        'state': {
            'gameState': game,
            'playerColor': game.player_id_mapping[player_id],
            'colorMapping': {
                color.name: player_id_to_player_name[player_id]
                for player_id, color
                in game.player_id_mapping.items()
            }
        }
    } if game.player_id_mapping else {'state': {}}
