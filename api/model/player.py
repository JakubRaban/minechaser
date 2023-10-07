from enum import Enum
from typing import List, Tuple, Dict

from helpers import sum_positions
from model.events import ActionOutcome
from types_ import Position


class PlayerColor(Enum):
    RED = 'red'
    BLUE = 'blue'
    GREEN = 'green'
    YELLOW = 'yellow'

    def __getstate__(self):
        return self.name


class Direction(Enum):
    RIGHT = (0, 1)
    LEFT = (0, -1)
    UP = (-1, 0)
    DOWN = (1, 0)
    NONE = (0, 0)

    def __getstate__(self):
        return self.name


class Player:
    def __init__(self, starting_position: Position):
        self.position = starting_position
        self.score = 0
        self.mistakes = 0
        self.bonus = None
        self.inventory = []
        self.effects = []
        self.alive = True

    def calculate_new_position(self, direction: Direction) -> Position:
        # TODO process the direction through the list of effects
        return sum_positions(self.position, direction.value)

    def process_outcome(self, outcome: ActionOutcome):
        if outcome.points_change > 0:
            self.score += outcome.points_change
        if outcome.points_change < 0:
            self.mistakes += 1
            outcome.points_change = max(outcome.points_change * (self.mistakes - 1), -3)
            self.score += outcome.points_change
        if outcome.kill:
            self.alive = False

    def __getstate__(self):
        return {k: v for k, v in self.__dict__.items() if k not in ['bonus', 'inventory', 'effects'] or v}


class Players:
    def __init__(self, starting_positions: List[Position]):
        self.players = {
            color: Player(starting_positions[index])
            for index, color in enumerate(PlayerColor)
            if index < len(starting_positions)
        }

    def __getitem__(self, color: PlayerColor | Tuple[PlayerColor]) -> Player | Dict[PlayerColor, Player]:
        if isinstance(color, tuple):
            return {c: self.players[c] for c in color}
        return self.players[color]

    def colors(self):
        return self.players.keys()

    def values(self):
        return self.players.values()

    @property
    def positions(self):
        return [player.position for player in self.players.values()]

    def __getstate__(self):
        return {color.name: player for color, player in self.players.items()}
