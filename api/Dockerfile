FROM python:3.13.3
WORKDIR /app
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip3 install --no-cache-dir --upgrade -r requirements.txt
COPY . .
EXPOSE 5000
CMD exec gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 --bind 0.0.0.0:5000 app:socketio_app