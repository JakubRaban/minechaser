from flaskconfig import app, socketio
from views.viewtwo import *
from views.viewone import *


if __name__ == '__main__':
    socketio.run(app)
