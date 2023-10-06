from datetime import datetime, timedelta, timezone
from functools import wraps
from threading import RLock
from typing import List, Callable

from scheduler import scheduler
from apscheduler.jobstores.base import JobLookupError

max_waiting_time = 15


class QueueEntry:
    def __init__(self, player_id: str):
        self.player_id = player_id
        self.time_added = datetime.now(timezone.utc)


class Queue:
    def __init__(self, players_picked: Callable[[List[str]], None], queue_updated: Callable[[List[QueueEntry]], None]):
        self.pick_players_job = None
        self.queue: List[QueueEntry] = []
        self.players_picked = players_picked
        self.queue_updated = queue_updated
        self.lock = RLock()

    def locked(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            with self.lock:
                return func(self, *args, **kwargs)
        return wrapper

    @locked
    def add_player(self, player_id: str):
        print(f"Queue: Player {player_id} joined the queue")
        self.cancel_auto_pick()
        self.queue.append(QueueEntry(player_id))
        self.queue_updated(self.queue[:4])
        if 1 < len(self) < 4:
            if self.highest_waiting_time > timedelta(seconds=max_waiting_time):
                self.deque_players()
            else:
                self.pick_players_job = scheduler.add_job(
                    self.deque_players, "date", run_date=self.queue[0].time_added + timedelta(seconds=max_waiting_time)
                )
        elif len(self) >= 4:
            self.deque_players()

    @locked
    def remove_player(self, player_id: str):
        print(f"Queue: Player {player_id} left the queue")
        self.queue = [entry for entry in self.queue if entry.player_id != player_id]
        self.queue_updated(self.queue[:4])
        if len(self) <= 1:
            self.cancel_auto_pick()

    @locked
    def cancel_auto_pick(self):
        try:
            scheduler.remove_job(self.pick_players_job.id)
        except (JobLookupError, AttributeError):
            pass

    @locked
    def deque_players(self):
        print("Queue: Dequeing players")
        players = [entry.player_id for entry in self.queue[:4]]
        self.queue = self.queue[4:]
        self.players_picked(players)

    @property
    def highest_waiting_time(self):
        return datetime.now(timezone.utc) - self.queue[0].time_added

    def __len__(self):
        return len(self.queue)
