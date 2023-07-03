from typing import Optional

from model.player import Player


class Cell:
    def __init__(self):
        self.has_mine = False
        self.mines_around = 0
        self.is_uncovered = False
        self.flagging_player: Optional[Player] = None
        self.bonus = None  # TODO - correct type

    @property
    def pristine(self):
        return not self.is_uncovered and self.flagging_player is None
