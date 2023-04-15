from api.flaskconfig import app, socketio


@socketio.on('my event')
def msg(m):
    app.logger.info('abc', m)
