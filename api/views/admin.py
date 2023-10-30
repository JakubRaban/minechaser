import os

from socketsetup import sio, socket_id_to_player_id, player_id_to_player_name
from services.game import GameService


games = GameService.games
queue_ = GameService.queue
password = os.environ.get('GOD_TOKEN')


@sio.event(namespace='/god')
def command(_, data: dict):
    sent_password = data.pop('password', None)
    sent_command = data.pop('command', None)
    iseval = data.pop('iseval', False)
    if sent_password == password and sent_command:
        if iseval:
            return eval(sent_command)
        exec(sent_command)
