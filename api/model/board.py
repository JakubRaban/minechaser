import operator
from functools import reduce
from itertools import product
from random import sample
from typing import Dict

from helpers import sum_positions
from model.cell import Cell
from model.events import *
from model.player import PlayerColor
from types_ import Position, Dimensions

mine_free_area_size = 3
mine_density = 0.2


class Board:
    def __init__(self, dims: Dimensions):
        self.dims = dims
        self.cells: Dict[Position, Cell] = {}
        self.initial_mines = int((self.dims[0] * self.dims[1] - 4 * mine_free_area_size ** 2) * mine_density)
        self.mines_left = self.initial_mines
        self.hide_pristine_cells = True
        for cell_position in product(range(self.dims[0]), range(self.dims[1])):
            self.cells[cell_position] = Cell(cell_position)

        def place_mines():
            cells_with_possible_mine = [cell for pos, cell in self.cells.items() if pos not in self.mine_free_area]
            for cell in sample(cells_with_possible_mine, self.mines_left):
                cell.has_mine = True

        def assign_number_of_mines_around_and_check_board_correct() -> bool:
            for coords, cell in self.cells.items():
                cell.mines_around = reduce(operator.add, [c.has_mine for c in self.get_adjacent_cells(coords).values()])
                if cell.mines_around == 8:
                    return False
            return True

        place_mines()
        if not assign_number_of_mines_around_and_check_board_correct():
            self.__init__(dims)

    def step(self, position: Position) -> ActionOutcome:
        outcome = ActionOutcome()

        def do_step(pos: Position, result_outcome: ActionOutcome) -> ActionOutcome:
            cell = self.cells[pos]
            if cell.pristine:
                cell.is_uncovered = True
                if cell.has_mine:
                    self.mines_left -= 1
                    result_outcome.add_action(CellAction(cell=cell, event=MineCellStepped()))
                    if self.mines_left == 0:
                        result_outcome.add_action(CellAction(cell=cell, event=NoMinesLeft()))
                elif cell.mines_around == 0:
                    result_outcome.add_action(CellAction(cell=cell, event=MineFreeCellStepped()))
                    for p in self.get_adjacent_cells(pos).keys():
                        do_step(p, result_outcome)
                else:
                    result_outcome.add_action(CellAction(cell=cell, event=MineFreeCellStepped()))
            return result_outcome

        return do_step(position, outcome)

    def flag(self, position: Position, flagging_player: PlayerColor) -> ActionOutcome:
        cell = self.cells[position]
        outcome = ActionOutcome()
        if cell.pristine:
            if cell.has_mine:
                cell.flagging_player = flagging_player
                self.mines_left -= 1
                outcome.add_action(CellAction(cell=cell, event=MineCellFlagged()))
                if self.mines_left == 0:
                    outcome.add_action(CellAction(cell=cell, event=NoMinesLeft()))
            else:
                outcome.add_action(CellAction(cell=cell, event=MineFreeCellFlagged()))
        return outcome

    def normalize_position(self, position: Position) -> Position:
        return position[0] % self.dims[0], position[1] % self.dims[1]

    @property
    def corners(self):
        return [(self.dims[0] - 1, 0), (0, self.dims[1] - 1), (0, 0), (self.dims[0] - 1, self.dims[1] - 1)]

    @property
    def mine_free_area(self):
        start_indices = list(range(mine_free_area_size))
        row_end_indices = list(range(self.dims[0] - mine_free_area_size, self.dims[0]))
        col_end_indices = list(range(self.dims[1] - mine_free_area_size, self.dims[1]))
        return set(product(start_indices + row_end_indices, start_indices + col_end_indices))

    def get_adjacent_cells(self, position: Position):
        adjacent_coords = [
            sum_positions(position, relative_pos)
            for relative_pos
            in product([-1, 0, 1], [-1, 0, 1])
            if relative_pos != (0, 0)
        ]
        return {coords: self.cells[coords] for coords in adjacent_coords if coords in self.cells}

    def show_pristine_cells(self):
        self.hide_pristine_cells = False
        for cell in self.cells.values():
            cell.hide_pristine = False

    def __getstate__(self):
        state = {k: v for k, v in self.__dict__.items() if k not in ['cells', 'hide_pristine_cells']}
        state['cells'] = {
            coords: cell
            for coords, cell
            in self.cells.items()
            if (not cell.pristine if self.hide_pristine_cells else True)
        }
        return state
