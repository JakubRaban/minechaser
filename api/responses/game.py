from model import GameProxy
from socketsetup import sio


def end_game(game: GameProxy, game_id: str):
    print(f"Response: Ending game {game_id}")
    # TODO send game results
    sio.emit('game_ended', room=game_id)
