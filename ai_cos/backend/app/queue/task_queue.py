from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    RETRYING = "retrying"

class TaskEnvelope(BaseModel):
    task_id: str
    target_agent_id: str
    payload: Dict[str, Any]
    status: TaskStatus = TaskStatus.PENDING
    retry_count: int = 0
    max_retries: int = 3
    priority: int = 0

class ITaskQueueProducer(ABC):
    """Asynchronous interface to dispatch workload envelopes safely."""
    
    @abstractmethod
    async def publish_task(self, task: TaskEnvelope) -> bool:
        """Enqueue task envelope to active broker queue."""
        pass

class ITaskQueueConsumer(ABC):
    """Abstract background worker loop parsing tasks from broker."""
    
    @abstractmethod
    async def poll_next_task(self) -> Optional[TaskEnvelope]:
        """Block and wait for next eligible high-priority task."""
        pass

    @abstractmethod
    async def update_task_progress(self, task_id: str, status: TaskStatus, result: Optional[Dict[str, Any]] = None, error: Optional[str] = None) -> None:
        """Broadband state updates on worker task outcome."""
        pass\n