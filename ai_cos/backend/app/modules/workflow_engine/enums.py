from enum import Enum

class WorkflowState(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"
    ROLLING_BACK = "rolling_back"
    ROLLED_BACK = "rolled_back"
    AWAITING_APPROVAL = "awaiting_approval"

class WorkflowEventType(str, Enum):
    STARTED = "workflow.started"
    STEP_COMPLETED = "workflow.step_completed"
    STEP_FAILED = "workflow.step_failed"
    APPROVAL_REQUESTED = "workflow.approval_requested"
    APPROVAL_GRANTED = "workflow.approval_granted"
    CHECKPOINT_CREATED = "workflow.checkpoint_created"
    STATE_TRANSITIONED = "workflow.state_transitioned"
    COMPLETED = "workflow.completed"
    FAILED = "workflow.failed"
