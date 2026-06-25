from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from .enums import WorkflowState, WorkflowEventType

class RetryStrategy(BaseModel):
    max_attempts: int = Field(default=3, ge=1)
    initial_backoff_seconds: float = Field(default=2.0)
    multiplier: float = Field(default=2.0)
    exponential: bool = Field(default=True)

class TaskDependency(BaseModel):
    parent_step_id: str
    child_step_id: str
    dependency_type: str = "on_success"  # "on_success", "on_fail", "always"

class WorkflowStep(BaseModel):
    step_id: str
    name: str
    description: str
    assigned_role: str = "assistant"
    input_schema: Dict[str, Any] = Field(default_factory=dict)
    output_schema: Dict[str, Any] = Field(default_factory=dict)
    retry_strategy: RetryStrategy = Field(default_factory=RetryStrategy)
    is_nested_workflow: bool = False
    nested_workflow_definition_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class HumanApprovalStep(BaseModel):
    approval_id: str
    step_id: str
    requested_by_agent_id: str
    required_clearance_level: str = "manager"
    comments_prompt: str = "Please review before proceeding."
    timeout_seconds: int = 86400  # 24 hours

class ApprovalGate(BaseModel):
    gate_id: str
    is_approved: bool = False
    approved_by_user_id: Optional[str] = None
    approved_at: Optional[datetime] = None
    ai_validation_summary: Optional[str] = None
    rejection_reason: Optional[str] = None

class WorkflowDefinition(BaseModel):
    definition_id: str
    name: str
    description: str
    version: str = "1.0.0"
    steps: List[WorkflowStep] = Field(default_factory=list)
    dependencies: List[TaskDependency] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WorkflowContext(BaseModel):
    workflow_id: str
    global_variables: Dict[str, Any] = Field(default_factory=dict)
    step_outputs: Dict[str, Any] = Field(default_factory=dict)
    active_agent_tokens: Dict[str, str] = Field(default_factory=dict)
    execution_sandbox_paths: Dict[str, str] = Field(default_factory=dict)

class WorkflowExecution(BaseModel):
    workflow_id: str
    definition_id: str
    state: WorkflowState = WorkflowState.PENDING
    context: WorkflowContext
    current_step_ids: List[str] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

class ExecutionHistory(BaseModel):
    workflow_id: str
    step_id: str
    attempt_number: int
    started_at: datetime
    completed_at: datetime
    status: str
    output: Optional[Dict[str, Any]] = None
    error_log: Optional[str] = None

class WorkflowMetrics(BaseModel):
    workflow_id: str
    total_duration_seconds: float = 0.0
    completed_steps_count: int = 0
    failed_steps_count: int = 0
    retry_count: int = 0
    total_token_overhead: int = 0
    estimated_run_cost_usd: float = 0.0

class WorkflowEvents(BaseModel):
    event_id: str
    workflow_id: str
    event_type: WorkflowEventType
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
