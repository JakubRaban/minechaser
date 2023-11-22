from model import GameProxy
from socketsetup import player_id_to_player_name


def game_state(game: GameProxy, player_id: str):
    return {
        'state': {
            'gameState': game,
            'playerColor': game.players[player_id],
            'colorMapping': {
                color.name: player_id_to_player_name[player_id]
                for player_id, color
                in game.players.items()
            }
        }
    } if game.created else {'state': {}, 'isPrivate': game.is_private}
