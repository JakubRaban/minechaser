import pytest
from pytest_mock import MockerFixture
from model.board import Board


@pytest.fixture
def board(mocker: MockerFixture):
    mocker.patch.object(Board, '_place_mines')
    board = Board((5, 5), 0, 0, lambda: None)
    yield board


def test_corners(board: Board):
    assert all(corner in board.corners for corner in [(0,0), (0,4), (4,0), (4,4)])


@pytest.mark.parametrize('mine_positions, is_correct', [
    ([(1,2), (2,3), (3,2), (2,1)], False),
    ([(1,2), (2,3), (2,1)], True)
])
def test_check_board_correct(board: Board, mine_positions, is_correct):
    board.initial_mines = len(mine_positions)
    for mine_position in mine_positions:
        board.cells[mine_position].has_mine = True
    assert board._check_board_correct() == is_correct


@pytest.mark.parametrize('cell_position, mine_positions, result', [
    ((0,0), [(0,1), (1,0)], 2),
    ((2,2), [(3,2), (3,3), (1,1)], 3),
    ((2,2), [(0,0), (4,4)], 0),
    ((0,0), [(0,1), (0,4)], 1)
])
def test_assign_number_of_mines_around(board: Board, cell_position, mine_positions, result):
    for mine_position in mine_positions:
        board.cells[mine_position].has_mine = True
    board._assign_number_of_mines_around()
    assert board.cells[cell_position].mines_around == result
