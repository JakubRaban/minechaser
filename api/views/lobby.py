from services.games import queue


def join_queue(player_id):
    print(f"Player {player_id} joined the queue")
    queue.add_player(player_id)


def leave_queue(player_id):
    print(f"Player {player_id} left the queue")
    queue.remove_player(player_id)
