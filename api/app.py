from gevent import pywsgi, monkey
monkey.patch_all()

import bottle
import socketio
from geventwebsocket.handler import WebSocketHandler
from pathlib import Path
import jsonpickle
import atexit
from socketsetup import sio, socket_id_to_player_id, player_id_to_player_name


if Path('store/playerids.txt').exists():
    with open('store/playerids.txt', 'r') as f:
        socket_id_to_player_id = jsonpickle.loads(f.read())

if Path('store/playernames.txt').exists():
    with open('store/playernames.txt', 'r') as f:
        player_id_to_player_name = jsonpickle.loads(f.read())


def dump_state():
    Path('store/').mkdir(parents=True, exist_ok=True)
    with open('store/playerids.txt', 'w') as f:
        f.write(jsonpickle.dumps(socket_id_to_player_id))
    with open('store/playernames.txt', 'w') as f:
        f.write(jsonpickle.dumps(player_id_to_player_name))


atexit.register(dump_state)


@bottle.route('/robots.txt')
def robots():
    return bottle.static_file('robots.txt', 'dist')


@bottle.route('/iamthegod')
def god():
    return bottle.template('dist/god.html')


@bottle.route('/dist/<mypath:path>')
def static_files_route(mypath):
    return bottle.static_file(mypath, 'dist')


@bottle.route('<mypath:path>')
def route(mypath):
    return bottle.template('dist/index.html')


socketio_app = socketio.WSGIApp(sio, bottle.default_app())


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), socketio_app, handler_class=WebSocketHandler).serve_forever()
