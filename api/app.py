from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
app.debug = True

socketio = SocketIO(app, cors_allowed_origins="*")

import views.viewone
import views.viewtwo

if __name__ == '__main__':
    socketio.run(app)
