from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

# Import base class and models from the Agent Framework
from agent_framework.base import BaseAgent
from agent_framework.models import AgentPermissions, AgentTask, AgentResult
from agent_framework.interfaces import AgentMemory, AgentCommunication
from agent_framework.enums import AgentState
from model_adapter.interfaces import ProviderAdapter

from .enums import SeniorityLevel, EmployeeStatus, AvailabilityStatus
from .models import EmployeeProfile, EmployeeCalendar, EmployeeKPI, EmployeeObjective
from .interfaces import IEmployeeOperations


class BaseEmployee(BaseAgent, IEmployeeOperations, ABC):
    """
    Abstract Base Class representing a Corporate Employee inside the Operating System.
    Bridges the low-level agent abstraction layer into a fully-functional human/AI 
    Employee System with integrated skills, performance trackers, calendars, and KPIs.
    """

    def __init__(
        self,
        profile: EmployeeProfile,
        permissions: AgentPermissions,
        memory: AgentMemory,
        communication: AgentCommunication,
        model_adapter: ProviderAdapter,
        tool_registry: Optional[Any] = None,
        tool_executor: Optional[Any] = None
    ):
        # Initialize the underlying BaseAgent framework
        super().__init__(profile, permissions, memory, communication)
        
        # Explicitly keep a strongly-typed reference to the employee profile
        self.employee_profile: EmployeeProfile = profile
        self.model_adapter = model_adapter
        self.tool_registry = tool_registry
        self.tool_executor = tool_executor

    async def on_initialize(self) -> None:
        """Lifecycle hook triggered when the agent is instantiated into active service pool."""
        self.update_health_status(AgentState.INITIALIZING)
        self.log_activity(f"Initializing Corporate Employee '{self.profile.name}' ({self.profile.agent_id}) resources...")
        self.update_health_status(AgentState.IDLE)

    async def on_task_start(self, task: AgentTask) -> None:
        """Lifecycle hook triggered immediately prior to executing a scheduled task."""
        self.update_health_status(AgentState.PLANNING)
        self.log_activity(f"Starting task execution: {task.task_id} - Description: {task.description[:60]}")
        self.metrics.total_tasks_received += 1
        self.metrics.last_active_at = datetime.utcnow()

    async def on_task_complete(self, result: AgentResult) -> None:
        """Lifecycle hook triggered upon successful outcome derivation of a task."""
        self.update_health_status(AgentState.IDLE)
        self.log_activity(f"Completed task execution: {result.task_id} - Success: {result.success}")
        if result.success:
            self.metrics.total_tasks_completed += 1
        else:
            self.metrics.total_tasks_failed += 1
            
        if result.token_usage:
            self.metrics.total_token_spend += result.token_usage.get("total_tokens", 0)
            self.metrics.total_cost_usd += result.token_usage.get("estimated_cost_usd", 0.0)

    async def on_terminate(self) -> None:
        """Lifecycle hook triggered before the agent context is wiped and resources freed."""
        self.update_health_status(AgentState.TERMINATED)
        self.log_activity(f"Corporate Employee '{self.profile.name}' standing down from active pool.")

    @abstractmethod
    async def execute_task(self, task: AgentTask) -> AgentResult:
        """
        The core execution loop of the Employee. Must be implemented by specific role types.
        Inherited from BaseAgent.
        """
        pass

    # -------------------------------------------------------------------------
    # Implementation of IEmployeeOperations (Production-ready Architectural Stubs)
    # -------------------------------------------------------------------------

    async def delegate(self, task: AgentTask, subordinate_id: str) -> AgentResult:
        """
        Delegate an active task to a subordinate employee under direct reporting relationship.
        """
        if not self.permissions.can_delegate_tasks:
            self.log_activity(f"Delegation rejected: Employee lacks delegation clearance.")
            raise PermissionError(f"Employee {self.employee_profile.employee_id} does not have delegation permissions.")

        self.log_activity(f"Delegating task '{task.task_id}' to subordinate Employee '{subordinate_id}'")
        
        # Structural routing mechanism without business execution logic
        return AgentResult(
            task_id=task.task_id,
            success=True,
            output_data={
                "routing_status": "DELEGATED",
                "delegate_id": subordinate_id,
                "timestamp": datetime.utcnow().isoformat()
            },
            duration_seconds=0.05
        )

    async def collaborate(self, collaborator_ids: List[str], topic: str, shared_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Engage in collaborative reasoning or execution sessions with other employees.
        """
        self.log_activity(f"Initiated collaboration with peers: {collaborator_ids} on topic: '{topic}'")
        
        # Structural integration hook returning standard architectural session metadata
        return {
            "session_id": f"collab-session-{datetime.utcnow().timestamp()}",
            "topic": topic,
            "status": "COLLABORATION_ESTABLISHED",
            "participants": collaborator_ids,
            "timestamp": datetime.utcnow().isoformat()
        }

    async def learn(self, doc_path: str, category: str) -> bool:
        """
        Ingest new semantic corporate material into personal knowledge bases or memory spaces.
        """
        self.log_activity(f"Ingesting knowledge document: {doc_path} [Category: {category}]")
        
        # Persist standard knowledge base indexing tag
        if doc_path not in self.employee_profile.knowledge_base:
            self.employee_profile.knowledge_base.append(doc_path)
            
        # Store reference inside memory
        await self.memory.store(
            key=f"knowledge_doc_{category}",
            val=doc_path,
            metadata={
                "ingested_at": datetime.utcnow().isoformat(),
                "category": category
            }
        )
        return True

    async def improve(self, evaluation_feedback: str) -> bool:
        """
        Refine internal persona guidelines and parameters based on performance reviews.
        """
        self.log_activity(f"Applying organizational improvement feedback.")
        
        # Store review in episodic memory to influence future prompt-building chains
        await self.memory.store(
            key="last_evaluation_feedback",
            val=evaluation_feedback,
            metadata={"timestamp": datetime.utcnow().isoformat()}
        )
        
        # Adjust internal configuration safety settings (e.g. slight temperature optimization)
        self.context.temperature = max(0.1, min(self.context.temperature - 0.05, 0.8))
        return True
