from __main__ import socketio


@socketio.event()
def connect():
    print("HELLO")
