from model import GameProxy, ActionResult
from model.game import CellUpdate
from socketsetup import sio


class GameResponses:
    @staticmethod
    def finish_game(game: GameProxy, game_id: str):
        print(f"Response: Ending game {game_id}")
        sio.emit('game_finished', game, room=game_id)

    @staticmethod
    def server_update(game_id: str, server_update: ActionResult | CellUpdate):
        sio.emit('action_result', server_update, room=game_id)
