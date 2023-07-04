from socketsetup import sio
from services.games import queue


@sio.event
def join_queue(sid):
    queue.add_player(sid)


@sio.event
def leave_queue(sid):
    queue.remove_player(sid)
