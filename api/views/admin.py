import os

from socketsetup import sio, socket_id_to_player_id, player_id_to_player_name
from services.game import GameService


games = GameService.games
queue_ = GameService.queue
socket_id_to_player_id = socket_id_to_player_id
player_id_to_player_name = player_id_to_player_name
password = os.environ.get('GOD_TOKEN')


@sio.event(namespace='/god')
def command(_, data: dict):
    sent_password = data.pop('password', None)
    sent_command = data.pop('command', None)
    is_eval = data.pop('iseval', False)
    print(len(password))
    if password and sent_command and sent_password == password:
        if is_eval:
            return eval(sent_command)
        exec(sent_command)
        return 'OK'
