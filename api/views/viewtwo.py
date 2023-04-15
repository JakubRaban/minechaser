from api.flaskconfig import app, socketio


@socketio.on('connect')
def c():
    app.logger.info('def')
