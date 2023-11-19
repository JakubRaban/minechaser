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
        self.bonus: Optional['Bonus'] = None
        self.hide_pristine = True

    @property
    def pristine(self):
        """Cell is untouched by players"""
        return not self.is_uncovered and self.flagging_player is None

    @property
    def contentful(self):
        """Cell has been touched by some player or there is a bonus in there"""
        return not self.pristine or self.bonus

    def __getstate__(self):
        return {
            k: v
            for k, v
            in self.__dict__.items()
            if k not in (
                ['has_mine', 'mines_around']
                if self.pristine and self.hide_pristine
                else []
            )
            and v is not None
        }
