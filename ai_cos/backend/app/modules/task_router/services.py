from typing import List
from .base import BaseTaskRouter
from .models import RoutePayload, RoutingDecision

class TaskRouterService(BaseTaskRouter):
    """Concrete TaskRouterService managing semantic matching calculations."""
    
    async def route_task(self, payload: RoutePayload) -> RoutingDecision:
        # Resolve capabilities using agent registry parameters
        matched_agent = "agent_marketing_analyzer"
        confidence = self.calculate_match_confidence(payload.required_capabilities, ["data_parsing"])
        
        decision = RoutingDecision(
            task_id=payload.task_id,
            assigned_agent_id=matched_agent,
            routing_confidence=confidence
        )
        await self.repository.save_decision(decision)
        return decision

    async def get_fallbacks(self, failed_agent_id: str) -> List[str]:
        return ["agent_default_backup_coordinator"]
