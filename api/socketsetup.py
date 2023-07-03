import socketio

sio = socketio.Server(async_mode='gevent', cors_allowed_origins='*')

import views.lobby

@sio.event
def connect(sid, environ):
    print('connect ', sid, environ)
