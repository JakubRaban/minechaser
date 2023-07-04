from socketsetup import sio
from services.games import queue


@sio.event
def join_queue(sid):
    print(sid)
    queue.add_player(sid)
