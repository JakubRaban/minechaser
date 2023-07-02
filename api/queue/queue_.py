from datetime import datetime, timedelta
from typing import List, Callable

from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BackgroundScheduler


waiting_time = 5


class QueueEntry:
    def __init__(self, socket_id: str):
        self.socket_id = socket_id
        self.time_added = datetime.now()


class Queue:
    def __init__(self, players_picked: Callable[[List[str]], None]):
        self.auto_pick_event = None
        self.queue: List[QueueEntry] = []
        self.players_picked = players_picked
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()

    def add_player(self, socket_id):
        self.queue.append(QueueEntry(socket_id))
        self.cancel_auto_pick()
        if 1 < len(self) < 4:
            if self.highest_waiting_time > timedelta(seconds=waiting_time):
                self.deque_players()
            else:
                self.auto_pick_event = self.scheduler.add_job(
                    self.deque_players, "date", run_date=self.queue[0].time_added + timedelta(seconds=waiting_time)
                )
        elif len(self) == 4:
            self.deque_players()

    def cancel_auto_pick(self):
        try:
            self.scheduler.remove_job(self.auto_pick_event.id)
        except (JobLookupError, AttributeError):
            pass

    def deque_players(self):
        players = [entry.socket_id for entry in self.queue[:4]]
        self.queue = self.queue[4:]
        self.players_picked(players)

    @property
    def highest_waiting_time(self):
        return datetime.now() - self.queue[0].time_added

    def __len__(self):
        return len(self.queue)