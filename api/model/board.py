import operator
import random
from datetime import datetime, timezone, timedelta
from functools import reduce
from itertools import product
from random import sample
from typing import Dict, Callable

from apscheduler.jobstores.base import JobLookupError

from helpers import sum_positions
from model.cell import Cell
from model.events import *
from model.player import PlayerColor
from scheduler import scheduler
from types_ import Position, Dimensions
from model.bonus import Bonus

mine_free_area_size = 3
mine_density = 0.2


class Board:
    def __init__(self, dims: Dimensions, on_bonus_added: Callable[[Cell], None]):
        self.dims = dims
        self.cells: Dict[Position, Cell] = {}
        self.initial_mines = int((self.dims[0] * self.dims[1] - 4 * mine_free_area_size ** 2) * mine_density)
        self.mines_left = self.initial_mines
        self.serialize_contentful_cells_only = True
        for cell_position in product(range(self.dims[0]), range(self.dims[1])):
            self.cells[cell_position] = Cell(cell_position)

        def place_mines():
            cells_with_possible_mine = [cell for pos, cell in self.cells.items() if pos not in self.mine_free_area]
            for cell in sample(cells_with_possible_mine, self.mines_left):
                cell.has_mine = True

        def assign_number_of_mines_around():
            for coords, cell in self.cells.items():
                cell.mines_around = reduce(operator.add, [c.has_mine for c in self.get_adjacent_cells(coords).values()])

        def check_board_correct():
            stack = self.corners
            marked = set(self.corners)
            target = len(self.cells) - self.initial_mines
            while stack:
                position = stack.pop()
                reachable_cells = [pos for pos, cell in self.get_adjacent_cells(position, walkable=True).items() if not cell.has_mine and pos not in marked]
                marked.update(reachable_cells)
                stack.extend(reachable_cells)
                if len(marked) == target:
                    break
            if len(marked) == target:
                for pos in [p for p, cell in self.cells.items() if cell.has_mine]:
                    if all(c.has_mine for c in self.get_adjacent_cells(pos, walkable=True).values()):
                        return False
                return True
            return False

        place_mines()
        if check_board_correct():
            def on_bonus_generated(bonus: Bonus):
                if position := self.place_bonus(bonus):
                    on_bonus_added(self.cells[position])

            assign_number_of_mines_around()
            if on_bonus_added:
                self.bonus_generator = BonusGenerator(on_bonus_generated)
        else:
            self.__init__(dims, on_bonus_added)

    def step(self, position: Position) -> ActionOutcome:
        outcome = ActionOutcome()
        recursively_stepped_cells = set()

        def do_step(pos: Position) -> ActionOutcome:
            cell = self.cells[pos]
            if cell.pristine:
                cell.is_uncovered = True
                if cell.has_mine:
                    self.mines_left -= 1
                    outcome.add_action(CellAction(cell=cell, event=MineCellStepped()))
                    if self.mines_left == 0:
                        outcome.add_action(CellAction(cell=cell, event=NoMinesLeft()))
                else:
                    recursively_stepped_cells.add(cell)
                    if cell.bonus:
                        bonus = cell.bonus
                        cell.bonus = None
                        outcome.add_action(CellAction(cell=cell, event=BonusCollectedEvent(bonus=bonus)))
                    if cell.mines_around == 0:
                        outcome.add_action(CellAction(cell=cell, event=MineFreeCellStepped()))
                        for p in [pos for pos in self.get_adjacent_cells(pos).keys() if not self.cells[pos] in recursively_stepped_cells]:
                            do_step(p)
                    else:
                        outcome.add_action(CellAction(cell=cell, event=MineFreeCellStepped()))
                return outcome
            return outcome.add_action(CellAction(cell=cell, event=UncoveredCellStepped()))

        return do_step(position)

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
                if cell.bonus:
                    bonus = cell.bonus
                    cell.bonus = None
                    outcome.add_action(CellAction(cell=cell, event=BonusCollectedEvent(bonus=bonus)))
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

    def get_adjacent_cells(self, position: Position, walkable=False):
        adjacent_coords = [
            sum_positions(position, relative_pos)
            for relative_pos
            in product([-1, 0, 1], [-1, 0, 1])
            if relative_pos not in ([(0, 0)] if not walkable else [(-1, -1), (-1, 1), (1, -1), (1, 1), (0, 0)])
        ]
        return {coords: self.cells[coords] for coords in adjacent_coords if coords in self.cells}

    def show_pristine_cells(self):
        self.serialize_contentful_cells_only = False
        for cell in self.cells.values():
            cell.hide_pristine = False

    def place_bonus(self, bonus: Bonus):
        try:
            position, random_pristine_cell = random.choice(
                [(pos, cell) for pos, cell in self.cells.items() if not cell.contentful]
            )
            random_pristine_cell.bonus = bonus
            return position
        except IndexError:
            return None

    def __getstate__(self):
        state = {k: v for k, v in self.__dict__.items() if k not in ['cells', 'hide_contentful_cells', 'bonus_generator']}
        state['cells'] = {
            coords: cell
            for coords, cell
            in self.cells.items()
            if (cell.contentful if self.serialize_contentful_cells_only else True)
        }
        return state


class BonusGenerator:
    def __init__(self, on_bonus_added: Callable[[Bonus], None]):
        self.on_bonus_added = on_bonus_added
        self.bonuses_generated = {'x2': 0, 'freeze': 0, 'disappear': 0}
        self.job = None
        self.add_next_job(random.uniform(30.0, 45.0))

    def generate_bonus(self):
        max_generated_bonus = max(self.bonuses_generated.values())
        bonuses = []
        for bonus, times_generated in self.bonuses_generated.items():
            bonuses.extend([bonus] * (max_generated_bonus + 1 - times_generated))
        picked_bonus = random.choice(bonuses)
        self.bonuses_generated[picked_bonus] += 1
        self.on_bonus_added(
            Bonus(
                picked_bonus,
                random.uniform(15.0, 20.0)
            )
        )
        self.add_next_job(random.uniform(45.0, 75.0))

    def add_next_job(self, interval: float):
        self.job = scheduler.add_job(
            self.generate_bonus,
            'date',
            run_date=datetime.now(timezone.utc) + timedelta(seconds=interval)
        )

    def stop(self):
        try:
            self.job.remove()
        except JobLookupError:
            pass
