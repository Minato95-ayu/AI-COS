from typing import Dict
from .models import RoutingDecision

class TaskRouterRepository:
    """Datastore to record real-time routing decisions and success weights."""
    
    def __init__(self):
        self._store: Dict[str, RoutingDecision] = {}

    async def save_decision(self, decision: RoutingDecision) -> None:
        self._store[decision.task_id] = decision
