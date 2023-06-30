from abc import ABC
from dataclasses import dataclass


@dataclass(kw_only=True)
class GameEvent(ABC):
    cell: 'Cell'
    points_change: int = 0
    kill: bool = False


@dataclass(kw_only=True)
class MineFreeCellStepped(GameEvent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


@dataclass(kw_only=True)
class MineCellStepped(GameEvent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.kill = True


@dataclass(kw_only=True)
class MineFreeCellFlagged(GameEvent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.points_change = -1


@dataclass(kw_only=True)
class MineCellFlagged(GameEvent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.points_change = 1

