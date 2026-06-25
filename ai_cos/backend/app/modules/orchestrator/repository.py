from typing import Dict
from .models import WorkflowExecution

class OrchestratorRepository:
    """Data Access repository for storing and tracking high-level workflow logs."""
    
    def __init__(self):
        self._store: Dict[str, WorkflowExecution] = {}

    async def save_execution(self, execution: WorkflowExecution) -> None:
        self._store[execution.workflow_id] = execution

    async def get_execution(self, workflow_id: str) -> WorkflowExecution:
        if workflow_id not in self._store:
            raise KeyError(f"Workflow '{workflow_id}' not found.")
        return self._store[workflow_id]
