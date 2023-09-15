from gevent import pywsgi, monkey
monkey.patch_all()

import socketio
from geventwebsocket.handler import WebSocketHandler

from socketsetup import sio


socketio_app = socketio.WSGIApp(sio, static_files={'/dist': './dist', '/': 'dist/index.html'})


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), socketio_app, handler_class=WebSocketHandler).serve_forever()
