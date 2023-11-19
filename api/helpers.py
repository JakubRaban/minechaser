import operator
import random

from types_ import Position


def sum_positions(pos1: Position, pos2: Position) -> Position:
    return tuple(map(operator.add, pos1, pos2))


def generate_game_id():
    letters = 'bcdfghjklmnpqrstvxz'
    return ''.join(random.choice(letters) for _ in range(8))
