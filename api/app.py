from gevent import pywsgi, monkey
monkey.patch_all()

import bottle
import socketio
from geventwebsocket.handler import WebSocketHandler

from socketsetup import sio


@bottle.route('/dist/<path:path>')
def static_files_route(path):
    return bottle.static_file(path, 'dist')


@bottle.route('<path:path>')
def route():
    return bottle.template('dist/index.html')


socketio_app = socketio.WSGIApp(sio, bottle.default_app())


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), socketio_app, handler_class=WebSocketHandler).serve_forever()
