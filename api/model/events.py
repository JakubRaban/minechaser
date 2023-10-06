from abc import ABC
from dataclasses import dataclass
from typing import List, Set, Type


@dataclass(kw_only=True)
class GameEvent(ABC):
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


@dataclass(kw_only=True)
class NoMinesLeft(GameEvent):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)


@dataclass
class CellAction:
    cell: 'Cell'
    event: GameEvent


class ActionOutcome:
    def __init__(self):
        self.cells: Set['Cell'] = set()
        self.event_types: Set[Type[GameEvent]] = set()
        self.points_change: int = 0
        self.kill: bool = False

    def add_action(self, action: CellAction | List[CellAction]):
        for act in ([action] if isinstance(action, CellAction) else action):
            self.event_types.add(type(act.event))
            self.cells.add(act.cell)
            self.points_change = act.event.points_change
            self.kill = self.kill or act.event.kill
        return self
