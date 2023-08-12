from model import GameProxy
from socketsetup import sio


class GameResponses:
    @staticmethod
    def finish_game(game: GameProxy, game_id: str):
        print(f"Response: Ending game {game_id}")
        sio.emit('game_finished', game, room=game_id)
