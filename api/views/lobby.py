from socketsetup import sio, with_user_id, socket_id_to_user_id
from services.games import queue


@sio.event
@with_user_id
def join_queue(sid):
    print(f"Player {sid} joined the queue")
    queue.add_player(sid)


@sio.event
@with_user_id
def leave_queue(sid):
    print(f"Player {sid} left the queue")
    queue.remove_player(sid)
