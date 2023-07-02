from __main__ import socketio

from api.services.games import queue


@socketio.event
def join_queue(data):
    print(data)
    queue.add_player('abc')
