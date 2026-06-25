from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from .enums import AgentRole, AgentState, ExecutionMode, ReasoningMode

class AgentCapability(BaseModel):
    name: str = Field(..., description="Unique name of the capability")
    description: str = Field(..., description="Details on what this capability does")
    complexity_level: int = Field(default=1, ge=1, le=5)
    parameters_schema: Dict[str, Any] = Field(default_factory=dict, description="Expected parameter schema for validation")

class AgentPermissions(BaseModel):
    allowed_tools: List[str] = Field(default_factory=list, description="List of tools the agent is allowed to invoke")
    allowed_departments: List[str] = Field(default_factory=list, description="Departments the agent is allowed to query")
    can_delegate_tasks: bool = Field(default=False)
    can_access_workspace: bool = Field(default=True)
    can_mutate_memory: bool = Field(default=True)
    max_token_spend_limit: float = Field(default=10.0, description="Max spend limit in USD")

class AgentMetrics(BaseModel):
    total_tasks_received: int = 0
    total_tasks_completed: int = 0
    total_tasks_failed: int = 0
    average_response_time_ms: float = 0.0
    total_token_spend: float = 0.0
    total_cost_usd: float = 0.0
    uptime_seconds: float = 0.0
    last_active_at: Optional[datetime] = None

class AgentHealth(BaseModel):
    status: AgentState = AgentState.IDLE
    cpu_usage_percent: float = 0.0
    memory_usage_percent: float = 0.0
    error_count: int = 0
    last_error_message: Optional[str] = None
    is_responsive: bool = True
    last_heartbeat: datetime = Field(default_factory=datetime.utcnow)

class AgentProfile(BaseModel):
    agent_id: str = Field(..., description="RFC-4122 UUID representing the employee")
    name: str = Field(..., description="Humanized name of the agent")
    role: AgentRole = Field(..., description="Functional role in the organization")
    department: str = Field(..., description="Target department identifier")
    skills: List[str] = Field(default_factory=list, description="Set of skills/qualifications")
    capabilities: List[AgentCapability] = Field(default_factory=list)
    preferred_models: List[str] = Field(..., description="Preferred models in order of priority (Ollama, Gemini, Claude, etc.)")
    reasoning_mode: ReasoningMode = ReasoningMode.RE_ACT
    execution_mode: ExecutionMode = ExecutionMode.AUTONOMOUS
    retry_policy: Dict[str, Any] = Field(
        default_factory=lambda: {"max_attempts": 3, "backoff_factor": 2.0, "initial_delay_seconds": 1.0}
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AgentContext(BaseModel):
    current_workflow_id: Optional[str] = None
    current_step_id: Optional[str] = None
    variables: Dict[str, Any] = Field(default_factory=dict)
    active_conversations: List[str] = Field(default_factory=list)
    temperature: float = Field(default=0.0)

class AgentTask(BaseModel):
    task_id: str
    description: str
    expected_output_format: str
    input_data: Dict[str, Any] = Field(default_factory=dict)
    timeout_seconds: int = 300
    assigned_at: datetime = Field(default_factory=datetime.utcnow)

class AgentResult(BaseModel):
    task_id: str
    success: bool
    output_data: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    token_usage: Dict[str, int] = Field(default_factory=dict)
    duration_seconds: float

class AgentEvent(BaseModel):
    event_id: str
    source_agent_id: str
    event_type: str  # e.g., "task_completed", "error_triggered", "state_changed"
    payload: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
