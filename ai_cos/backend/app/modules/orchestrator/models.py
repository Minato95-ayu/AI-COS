from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class ExecutionStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class WorkflowStep(BaseModel):
    step_id: str
    name: str
    target_agent_id: Optional[str] = None
    input_data: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    status: ExecutionStatus = ExecutionStatus.PENDING

class WorkflowExecution(BaseModel):
    workflow_id: str
    objective: str
    steps: List[WorkflowStep]
    status: ExecutionStatus = ExecutionStatus.PENDING
    metadata: Dict[str, Any] = Field(default_factory=dict)
