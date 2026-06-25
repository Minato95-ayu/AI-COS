from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pydantic import BaseModel

class RoutingOption(BaseModel):
    agent_id: str
    score: float
    rationale: str

class ISemanticRouter(ABC):
    """Dynamic gateway forwarding workload inputs to correct specialized systems."""

    @abstractmethod
    async def select_best_agent(self, task_description: str, registry_profiles: List[Dict[str, Any]]) -> RoutingOption:
        pass

    @abstractmethod
    async def rank_top_agents(self, task_description: str, limit: int = 3) -> List[RoutingOption]:
        pass

    @abstractmethod
    async def route_event(self, event_type: str, payload: Dict[str, Any]) -> str:
        pass\n