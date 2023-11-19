import humps

from .game import Game, GameProxy, ActionResult
from .player import Player, Players, PlayerColor, Direction
from .board import Board
from .cell import Cell
from .events import GameEvent, MineCellFlagged, NoMinesLeft, MineCellStepped, MineFreeCellFlagged, MineFreeCellStepped, ActionOutcome
from .bonus import Bonus

model_classes = [
    Board,
    Player,
    Players,
    PlayerColor,
    Direction,
    Cell,
    GameEvent,
    MineCellFlagged,
    NoMinesLeft,
    MineCellStepped,
    MineFreeCellFlagged,
    MineFreeCellStepped,
    Game,
    GameProxy,
    ActionResult,
    Bonus,
    ActionOutcome
]


def camelize_serialization(class_):
    def camelize(getstate):
        def new_getstate(self):
            state = getstate(self)
            return {humps.camelize(k): v for k, v in state.items()} if type(state) is dict else state

        return new_getstate

    class_.__getstate__ = camelize(
        class_.__getstate__
        if hasattr(class_, '__getstate__')
        else lambda self: self.__dict__
    )
    return class_


for class_ in model_classes:
    class_ = camelize_serialization(class_)
