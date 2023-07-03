from flask import Flask
import socketio

from gevent import pywsgi
from geventwebsocket.handler import WebSocketHandler

from socketsetup import sio


app = Flask(__name__, template_folder='dist', static_folder='dist')
app.debug = True


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return app.send_static_file('index.html')


socketio_app = socketio.WSGIApp(sio, app)


if __name__ == '__main__':
    pywsgi.WSGIServer(('', 5000), socketio_app, handler_class=WebSocketHandler).serve_forever()
