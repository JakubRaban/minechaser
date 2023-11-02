from datetime import timezone

from apscheduler.schedulers.gevent import GeventScheduler

scheduler = GeventScheduler(timezone=timezone.utc)
scheduler.start()
