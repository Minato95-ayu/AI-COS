from abc import ABC, abstractmethod
from typing import List
from .models import RoutingDecision, RoutePayload

class ITaskRouter(ABC):
    """Interface defining semantic routing, matching a discrete job step to an elite agent."""
    
    @abstractmethod
    async def route_task(self, payload: RoutePayload) -> RoutingDecision:
        """Evaluate capabilities and route task payload to the optimal active agent."""
        pass

    @abstractmethod
    async def get_fallbacks(self, failed_agent_id: str) -> List[str]:
        """Identify secondary agent IDs if the routed agent fails."""
        pass
