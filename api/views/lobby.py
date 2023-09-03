from services.game import GameService


def join_queue(player_id):
    print(f"Player {player_id} joined the queue")
    GameService.add_player_to_queue(player_id)


def leave_queue(player_id):
    print(f"Player {player_id} left the queue")
    GameService.remove_player_from_queue(player_id)


def create_private_game(player_id):
    print(f"Player {player_id} created a private game")
    return GameService.create_private_game(player_id)


def create_single_player_game(player_id):
    print(f"Player {player_id} created a single player game")
    GameService.create_private_game(player_id, single_player=True)


def join_private_game(player_id, data: dict):
    print(f"Player {player_id} joined a private game")
    game_id = data.pop('gameId', None)
    return GameService.join_private_game(game_id, player_id)


def leave_private_game(player_id, data: dict):
    print(f"Player {player_id} left a private game")
    game_id = data.pop('gameId', None)
    GameService.leave_private_game(game_id, player_id)


def start_private_game(player_id, data: dict):
    print(f"Player {player_id} started a private game")
    game_id = data.pop('gameId', None)
    size = data.pop('size', None)
    if game_id and size:
        GameService.start_private_game(game_id, player_id, tuple(size))
