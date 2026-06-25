from pydantic import BaseModel, Field
from typing import List, Dict, Any

class RoutePayload(BaseModel):
    task_id: str
    description: str
    required_capabilities: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class RoutingDecision(BaseModel):
    task_id: str
    assigned_agent_id: str
    routing_confidence: float
    routing_strategy: str = "capability_match"
