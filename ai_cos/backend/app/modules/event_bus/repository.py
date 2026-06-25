from typing import List
from .models import SystemEvent

class EventRepository:
    """Tracks dispatched system events, providing auditing logs."""
    
    def __init__(self):
        self._event_log: List[SystemEvent] = []

    async def log_event(self, event: SystemEvent) -> None:
        self._event_log.append(event)

    async def get_history(self, limit: int = 50) -> List[SystemEvent]:
        return self._event_log[-limit:]
