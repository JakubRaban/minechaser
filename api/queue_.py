from datetime import datetime, timedelta
from typing import List, Callable

from apscheduler.jobstores.base import JobLookupError
from apscheduler.schedulers.background import BackgroundScheduler


waiting_time = 15


class QueueEntry:
    def __init__(self, player_id: str):
        self.player_id = player_id
        self.time_added = datetime.now()


class Queue:
    def __init__(self, players_picked: Callable[[List[str]], None]):
        self.pick_players_job = None
        self.queue: List[QueueEntry] = []
        self.players_picked = players_picked
        self.scheduler = BackgroundScheduler()
        self.scheduler.start()

    def add_player(self, player_id: str):
        print(f"Queue: Player {player_id} joined the queue")
        self.queue.append(QueueEntry(player_id))
        self.cancel_auto_pick()
        if 1 < len(self) < 4:
            if self.highest_waiting_time > timedelta(seconds=waiting_time):
                self.deque_players()
            else:
                self.pick_players_job = self.scheduler.add_job(
                    self.deque_players, "date", run_date=self.queue[0].time_added + timedelta(seconds=waiting_time)
                )
        elif len(self) == 4:
            self.deque_players()

    def remove_player(self, player_id: str):
        print(f"Queue: Player {player_id} left the queue")
        self.queue = [entry for entry in self.queue if entry.player_id != player_id]
        if len(self) <= 1:
            self.cancel_auto_pick()

    def cancel_auto_pick(self):
        try:
            self.scheduler.remove_job(self.pick_players_job.id)
        except (JobLookupError, AttributeError):
            pass

    def deque_players(self):
        print("Queue: Dequeing players")
        players = [entry.player_id for entry in self.queue[:4]]
        self.queue = self.queue[4:]
        self.players_picked(players)

    @property
    def highest_waiting_time(self):
        return datetime.now() - self.queue[0].time_added

    def __len__(self):
        return len(self.queue)
