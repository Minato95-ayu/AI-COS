from abc import ABC, abstractmethod
from typing import Dict, Any, List
from .models import WorkflowExecution, WorkflowStep

class IOrchestrator(ABC):
    """Interface governing high-level async orchestrations of agents and tasks."""
    
    @abstractmethod
    async def start_workflow(self, objective: str, input_data: Dict[str, Any]) -> WorkflowExecution:
        """Initialize an asynchronous multi-agent workflow."""
        pass

    @abstractmethod
    async def execute_step(self, workflow_id: str, step: WorkflowStep) -> Dict[str, Any]:
        """Dispatches a single step to the Task Router."""
        pass

    @abstractmethod
    async def get_workflow_status(self, workflow_id: str) -> WorkflowExecution:
        """Check the status and history of an active workflow."""
        pass
