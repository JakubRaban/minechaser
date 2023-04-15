import logging

from flask import Flask
from flask_socketio import SocketIO

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins=['http://localhost:3000'])