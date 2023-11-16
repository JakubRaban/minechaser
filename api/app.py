from gevent import pywsgi, monkey
monkey.patch_all()

import bottle
from bottle_cors_plugin import cors_plugin
import socketio
from geventwebsocket.handler import WebSocketHandler
import json
from socketsetup import sio
from _email import send_message


@bottle.route('/robots.txt')
def robots():
    return bottle.static_file('robots.txt', 'dist')


@bottle.route('/iamthegod')
def god():
    return bottle.template('dist/god.html')


@bottle.post('/contact')
def contact():
    data = json.loads(bottle.request.body.read())
    email = data.pop('email', None)
    message = data.pop('message', None)
    if email and message and 20 <= len(message) <= 1000:
        send_message(email, message)


@bottle.route('/dist/<mypath:path>')
def static_files_route(mypath):
    return bottle.static_file(mypath, 'dist')


@bottle.route('<mypath:path>')
def route(mypath):
    return bottle.template('dist/index.html')


app = bottle.default_app()
app.install(cors_plugin([
    'http://localhost:3000',
    'http://localhost:5000',
    'https://plankton-app-tgr3d.ondigitalocean.app',
    'https://minechaser.com'
]))
socketio_app = socketio.WSGIApp(sio, app)


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), socketio_app, handler_class=WebSocketHandler).serve_forever()
