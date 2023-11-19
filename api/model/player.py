from datetime import datetime, timezone, timedelta
from enum import Enum
from typing import List, Tuple, Dict, Optional, Callable

from apscheduler.jobstores.base import JobLookupError

from helpers import sum_positions
from model.events import ActionOutcome
from model.bonus import Bonus
from scheduler import scheduler
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
    def __init__(self, color: PlayerColor, starting_position: Position, players: 'Players'):
        self.color = color
        self.position = starting_position
        self.score = 0
        self.mistakes = 0
        self.alive = True
        self.players = players

        self.bonus: Optional[Bonus] = None
        self.remove_bonus_job = None

    def add_bonus(self, bonus: Bonus, on_bonus_expired: Callable[['Player'], None]):
        bonus_valid_until = datetime.now(timezone.utc) + timedelta(seconds=bonus.valid_for)
        self.bonus = bonus
        self.bonus.expires_at = bonus_valid_until
        if self.remove_bonus_job:
            try:
                self.remove_bonus_job.remove()
            except JobLookupError:
                pass

        def remove_bonus():
            self.bonus = None
            on_bonus_expired(self)

        self.remove_bonus_job = scheduler.add_job(
            remove_bonus,
            'date',
            run_date=bonus_valid_until
        )

    def calculate_new_position(self, direction: Direction) -> Position:
        if 'freeze' in [(player.bonus.name if player.bonus else None) for color, player in self.players.players.items() if color != self.color]:
            return self.position
        return sum_positions(self.position, direction.value)

    def process_outcome(self, outcome: ActionOutcome):
        multiplier = 2 if self.bonus and self.bonus.name == 'x2' else 1
        outcome.points_change *= multiplier
        if outcome.points_change > 0:
            self.score += outcome.points_change
        if outcome.points_change < 0:
            self.mistakes += 1
            outcome.points_change = max(outcome.points_change * (self.mistakes - 1), -3 * multiplier)
            self.score += outcome.points_change
        if outcome.kill:
            self.alive = False

    def __getstate__(self):
        return {k: v for k, v in self.__dict__.items() if (k != 'colors' or v) and k not in ['remove_bonus_job', 'players']}


class Players:
    def __init__(self, starting_positions: List[Position]):
        self.players = {
            color: Player(color, starting_positions[index], self)
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
