from enum import Enum
from typing import List

from api.helpers import sum_positions
from api.model.events import GameEvent
from api.types import Position


class PlayerColor(Enum):
    RED = 'red'
    GREEN = 'green'
    BLUE = 'blue'
    YELLOW = 'yellow'


class Direction(Enum):
    RIGHT = (0, 1)
    LEFT = (0, -1)
    UP = (-1, 0)
    DOWN = (1, 0)
    NONE = (0, 0)


class Player:
    def __init__(self, starting_position: Position):
        self.position = starting_position
        self.score = 0
        self.bonus = None
        self.inventory = []
        self.effects = []
        self.alive = True

    def calculate_new_position(self, direction: Direction) -> Position:
        # TODO process the direction through the list of effects
        return sum_positions(self.position, direction.value)

    def process_events(self, events: List[GameEvent]):
        for event in events:
            if event.points_change:
                self.score += event.points_change
            if event.kill:
                self.alive = False
                break


class Players:
    def __init__(self, starting_positions: List[Position]):
        self.players = {
            color: Player(starting_positions[index])
            for index, color in enumerate(PlayerColor)
            if index < len(starting_positions)
        }

    def __getitem__(self, color: PlayerColor) -> Player:
        return self.players[color]

    def values(self):
        return self.players.values()

    @property
    def positions(self):
        return [player.position for player in self.players.values()]
