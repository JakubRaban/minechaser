from typing import List

from model.events import GameEvent
from model.player import Players, PlayerColor, Direction, Player
from model.board import Board, BoardDef


class ActionResult:
    def __init__(self, player: Player, events: List[GameEvent]):
        self.player = player
        self.cells = [event.cell for event in events]


class Game:
    def __init__(self, board_def: BoardDef, players_count: int):
        self.board = Board(board_def)
        starting_positions = self.board.corners[:players_count]
        self.players = Players(starting_positions)
        for player in self.players.values():
            self.board.step(player.position)

    def move(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        new_position = player.calculate_new_position(direction)
        if new_position not in self.players.positions:
            player.position = new_position
            events = self.board.step(new_position)
            player.process_events(events)
            return ActionResult(player, events)
        return ActionResult(player, [])

    def flag(self, player_color: PlayerColor, direction: Direction) -> ActionResult:
        player = self.players[player_color]
        new_position = player.calculate_new_position(direction)
        if new_position not in self.players.positions:
            events = self.board.flag(new_position, player_color)
            player.process_events(events)
            return ActionResult(player, events)
        return ActionResult(player, [])
