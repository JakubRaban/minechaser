from socketsetup import sio
from services.games import queue


@sio.event
def join_queue(sid, data):
    print(data)
    # queue.add_player('abc')
