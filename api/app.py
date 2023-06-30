from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__, template_folder='dist', static_folder='dist')
app.debug = True

socketio = SocketIO(app, cors_allowed_origins="*")

import views.viewone
import views.viewtwo


@app.route('/')
def index():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    socketio.run(app)
