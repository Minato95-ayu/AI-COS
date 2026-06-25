from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PlanStep(BaseModel):
    step_id: str
    description: str
    required_capabilities: List[str] = Field(default_factory=list)
    depends_on: List[str] = Field(default_factory=list)
    output_schema: Dict[str, Any] = Field(default_factory=dict)

class ExecutionPlan(BaseModel):
    plan_id: str
    goal: str
    steps: List[PlanStep]
    metadata: Dict[str, Any] = Field(default_factory=dict)
