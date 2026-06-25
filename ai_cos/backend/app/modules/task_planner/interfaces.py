from abc import ABC, abstractmethod
from typing import Dict, Any
from .models import ExecutionPlan

class ITaskPlanner(ABC):
    """Interface for decomposing complex high-level prompts into highly optimized step sequences."""
    
    @abstractmethod
    async def create_plan(self, goal: str, context: Dict[str, Any]) -> ExecutionPlan:
        """Deconstruct an enterprise goal into structured DAG steps."""
        pass

    @abstractmethod
    async def validate_plan(self, plan: ExecutionPlan) -> bool:
        """Validate that the planned step transitions are legal and dependency-safe."""
        pass
