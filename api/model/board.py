import operator
from functools import reduce
from itertools import product, chain
from random import sample
from typing import Dict, List

from api.helpers import sum_positions
from api.model.cell import Cell
from api.model.events import *
from api.model.player import PlayerColor
from api.types_ import Position, Dimensions


@dataclass
class BoardDef:
    dims: Dimensions
    mines: int
    mine_free_area_size: int


class Board:
    def __init__(self, board_def: BoardDef):
        self.board_def = board_def
        self.dims = self.board_def.dims
        self.cells: Dict[Position, Cell] = {}
        for cell_position in product(range(self.dims[0]), range(self.dims[1])):
            self.cells[cell_position] = Cell()

        def place_mines():
            cells_with_possible_mine = [cell for pos, cell in self.cells.items() if pos not in self.mine_free_area]
            for cell in sample(cells_with_possible_mine, self.board_def.mines):
                cell.has_mine = True

        def assign_number_of_mines_around_and_check_board_correct() -> bool:
            for coords, cell in self.cells.items():
                cell.mines_around = reduce(operator.add, [c.has_mine for c in self.get_adjacent_cells(coords).values()])
                if cell.has_mine and cell.mines_around == 8:
                    return False
            return True

        place_mines()
        if not assign_number_of_mines_around_and_check_board_correct():
            self.__init__(board_def)

    def step(self, position: Position) -> List[GameEvent]:
        cell = self.cells[self.normalize_position(position)]
        if cell.pristine:
            cell.is_uncovered = True
            if cell.has_mine:
                return [MineCellStepped(cell=cell)]
            if cell.mines_around == 0:
                return [MineFreeCellStepped(cell=cell)] + list(chain(
                    *[self.step(position) for position in self.get_adjacent_cells(position).keys()]
                ))
            else:
                return [MineFreeCellStepped(cell=cell)]
        else:
            return []

    def flag(self, position: Position, flagging_player: PlayerColor) -> List[GameEvent]:
        cell = self.cells[self.normalize_position(position)]
        if cell.pristine:
            if cell.has_mine:
                cell.flagging_player = flagging_player
                return [MineCellFlagged(cell=cell)]
            else:
                return [MineFreeCellFlagged(cell=cell)]
        else:
            return []

    # if position is outside the board, return a position on the board, assuming the board has connected ends
    def normalize_position(self, position: Position) -> Position:
        return position[0] % self.dims[0], position[1] % self.dims[1]

    @property
    def corners(self):
        return [(self.dims[0] - 1, 0), (0, self.dims[1] - 1), (0, 0), (self.dims[0] - 1, self.dims[1] - 1)]

    @property
    def mine_free_area(self):
        start_indices = list(range(self.board_def.mine_free_area_size))
        row_end_indices = list(range(self.dims[0] - self.board_def.mine_free_area_size, self.dims[0]))
        col_end_indices = list(range(self.dims[1] - self.board_def.mine_free_area_size, self.dims[1]))
        return set(product(start_indices + row_end_indices, start_indices + col_end_indices))

    def get_adjacent_cells(self, position: Position):
        adjacent_coords = [
            sum_positions(position, relative_pos)
            for relative_pos
            in product([-1, 0, 1], [-1, 0, 1])
            if relative_pos != (0, 0)
        ]
        return {coords: self.cells[coords] for coords in adjacent_coords if coords in self.cells}


standard_defs = {
    'beginner': BoardDef((10, 10), 10, 2),
    'intermediate': BoardDef((16, 16), 40, 2),
    'expert': BoardDef((30, 16), 99, 3),
}
