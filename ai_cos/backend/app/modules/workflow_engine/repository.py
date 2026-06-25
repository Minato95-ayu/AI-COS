from typing import Dict, Optional
from .interfaces import WorkflowRepository
from .models import WorkflowDefinition, WorkflowExecution

class WorkflowRepositoryImpl(WorkflowRepository):
    """
    In-memory storage and state catalog tracking executions and DAG structures.
    """

    def __init__(self):
        self._definitions: Dict[str, WorkflowDefinition] = {}
        self._executions: Dict[str, WorkflowExecution] = {}

    async def save_definition(self, definition: WorkflowDefinition) -> None:
        self._definitions[definition.definition_id] = definition

    async def get_definition(self, definition_id: str) -> Optional[WorkflowDefinition]:
        return self._definitions.get(definition_id)

    async def save_execution(self, execution: WorkflowExecution) -> None:
        self._executions[execution.workflow_id] = execution

    async def get_execution(self, workflow_id: str) -> Optional[WorkflowExecution]:
        return self._executions.get(workflow_id)
