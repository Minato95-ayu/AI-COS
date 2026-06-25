from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from .models import (
    WorkflowDefinition,
    WorkflowExecution,
    WorkflowStep,
    WorkflowContext,
    ApprovalGate,
    HumanApprovalStep,
    WorkflowMetrics,
)

class Workflow(ABC):
    """
    Interface representing a runable Workflow instance containing definition and current runtime tree.
    """
    @property
    @abstractmethod
    def definition(self) -> WorkflowDefinition:
        pass

    @property
    @abstractmethod
    def execution(self) -> WorkflowExecution:
        pass


class WorkflowScheduler(ABC):
    """
    Interface for queuing, prioritizing, and triggering long-running multi-agent workflows.
    """
    @abstractmethod
    async def schedule_workflow(self, definition_id: str, input_data: Dict[str, Any], priority: int = 0) -> str:
        """Enqueue workflow execution with priority queue mappings."""
        pass

    @abstractmethod
    async def pause_workflow(self, workflow_id: str) -> bool:
        """Pause a currently running workflow thread."""
        pass

    @abstractmethod
    async def resume_workflow(self, workflow_id: str) -> bool:
        """Resume a paused workflow context safely from checkpoint logs."""
        pass


class WorkflowExecutor(ABC):
    """
    Interface governing active step execution loops. Handles dispatching, state updates, and failures.
    """
    @abstractmethod
    async def execute(self, workflow_id: str) -> None:
        """Main non-blocking thread loop iterating through active step transitions."""
        pass

    @abstractmethod
    async def execute_step(self, workflow_id: str, step: WorkflowStep) -> Dict[str, Any]:
        """Dispatch step to specific corporate employee agent."""
        pass


class CheckpointManager(ABC):
    """
    Interface representing transactional checkpoint saves to enable safe rollbacks and recovery.
    """
    @abstractmethod
    async def create_checkpoint(self, workflow_id: str, label: str) -> str:
        """Persist current state, context variables, and step histories to disk."""
        pass

    @abstractmethod
    async def rollback_to_checkpoint(self, workflow_id: str, checkpoint_id: str) -> WorkflowContext:
        """Rollback active variables to a prior checkpoint layer."""
        pass


class MergeManager(ABC):
    """
    Interface responsible for reconciling and merging parallel execution contexts 
    back into a unified parent scope.
    """
    @abstractmethod
    async def merge_contexts(self, parent_context: WorkflowContext, branch_contexts: List[WorkflowContext]) -> WorkflowContext:
        """Resolve conflicting variable mutations from parallel task runs."""
        pass


class ResultCollector(ABC):
    """
    Interface responsible for collecting, auditing, and restructuring final metrics 
    and outputs of multi-agent activities.
    """
    @abstractmethod
    async def collect_results(self, workflow_id: str) -> Dict[str, Any]:
        """Aggregate data, formats, and structural artifacts from step records."""
        pass

    @abstractmethod
    async def summarize_metrics(self, workflow_id: str) -> WorkflowMetrics:
        """Calculate durations, token spends, and failure weights of a finished workflow."""
        pass


class WorkflowRepository(ABC):
    """
    Interface storing and retrieving historical DAG definitions, execution records, and transaction logs.
    """
    @abstractmethod
    async def save_definition(self, definition: WorkflowDefinition) -> None:
        pass

    @abstractmethod
    async def get_definition(self, definition_id: str) -> Optional[WorkflowDefinition]:
        pass

    @abstractmethod
    async def save_execution(self, execution: WorkflowExecution) -> None:
        pass

    @abstractmethod
    async def get_execution(self, workflow_id: str) -> Optional[WorkflowExecution]:
        pass


class WorkflowService(ABC):
    """
    Unified entry point governing global workflow operations for clients and external microservices.
    """
    @abstractmethod
    async def initiate_run(self, definition_id: str, global_inputs: Dict[str, Any]) -> WorkflowExecution:
        pass

    @abstractmethod
    async def request_human_approval(self, approval_request: HumanApprovalStep) -> None:
        pass

    @abstractmethod
    async def submit_human_approval(self, gate: ApprovalGate) -> WorkflowExecution:
        pass
