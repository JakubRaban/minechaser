from gevent import pywsgi, monkey
monkey.patch_all()

import bottle
import socketio
from geventwebsocket.handler import WebSocketHandler

from socketsetup import sio


@bottle.route('/robots.txt')
def robots():
    return bottle.static_file('robots.txt', 'dist')


@bottle.route('/dist/<mypath:path>')
def static_files_route(mypath):
    return bottle.static_file(mypath, 'dist')


@bottle.route('<mypath:path>')
def route(mypath):
    return bottle.template('dist/index.html')


socketio_app = socketio.WSGIApp(sio, bottle.default_app())


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), socketio_app, handler_class=WebSocketHandler).serve_forever()
