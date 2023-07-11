from typing import Optional

from model.player import PlayerColor
from types_ import Position


class Cell:
    def __init__(self, position: Position):
        self.position = position
        self.has_mine = False
        self.mines_around = 0
        self.is_uncovered = False
        self.flagging_player: Optional[PlayerColor] = None
        self.bonus = None  # TODO - correct type

    @property
    def pristine(self):
        return not self.is_uncovered and self.flagging_player is None

    def __getstate__(self):
        return {
            k: v
            for k, v
            in self.__dict__.items()
            if k not in (['has_mine', 'mines_around'] if self.pristine else [])
            and v is not None
        }
