from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Bonus:
    name: str
    valid_for: float
    expires_at: Optional[datetime] = None

    def __getstate__(self):
        return {'name': self.name, 'expiresAtTimestamp': self.expires_at}

