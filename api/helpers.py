import operator

from types_ import Position


def sum_positions(pos1: Position, pos2: Position) -> Position:
    return tuple(map(operator.add, pos1, pos2))
