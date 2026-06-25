from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class StepDefinition(BaseModel):
    step_id: str
    name: str
    description: str
    assigned_agent_id: str
    dependencies: List[str]
    expected_output_schema: Dict[str, Any]

class ExecutionPlan(BaseModel):
    plan_id: str
    goal: str
    steps: Dict[str, StepDefinition]
    metadata: Dict[str, Any]

class IPlanner(ABC):
    """Architectural blueprint of the operational reasoning engine."""

    @abstractmethod
    async def generate_plan(self, user_goal: str, context: Dict[str, Any]) -> ExecutionPlan:
        """Deconstruct high level human objectives into a clear multi-agent execution map."""
        pass

    @abstractmethod
    async def validate_plan(self, plan: ExecutionPlan) -> bool:
        """Audit the acyclic dependency structure and check model parameters."""
        pass

    @abstractmethod
    async def adjust_plan_on_error(self, plan: ExecutionPlan, failed_step_id: str, error_msg: str) -> ExecutionPlan:
        """Dynamically rewrite the remaining DAG branch when a single agent node fails."""
        pass\n