from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from .models import AgentTask, AgentResult, AgentEvent

class AgentMemory(ABC):
    """Interface for agent memory interaction (short-term episodic and long-term semantic caches)."""

    @abstractmethod
    async def recall(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant context from the agent's memory bank."""
        pass

    @abstractmethod
    async def store(self, key: str, val: Any, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Store a memory slice with indexing tags."""
        pass

    @abstractmethod
    async def clear_short_term(self) -> None:
        """Clear ephemeral short-term conversation logs."""
        pass

class AgentCommunication(ABC):
    """Interface allowing asynchronous peer-to-peer and broadcast communications among agents."""

    @abstractmethod
    async def send_direct_message(self, recipient_agent_id: str, message: Dict[str, Any]) -> bool:
        """Send a direct message payload to another corporate employee agent."""
        pass

    @abstractmethod
    async def broadcast_event(self, event: AgentEvent) -> None:
        """Emit an event to subscribed departments or systems via the global bus."""
        pass

    @abstractmethod
    async def subscribe_to_event(self, event_type: str, callback: Any) -> None:
        """Register a callback for a specific global system event type."""
        pass

class AgentLifecycle(ABC):
    """Lifecycle controller managing agent instantiation, initialization, run loops, and teardown."""

    @abstractmethod
    async def on_initialize(self) -> None:
        """Lifecycle hook triggered when the agent is instantiated into active service pool."""
        pass

    @abstractmethod
    async def on_task_start(self, task: AgentTask) -> None:
        """Lifecycle hook triggered immediately prior to executing a scheduled task."""
        pass

    @abstractmethod
    async def on_task_complete(self, result: AgentResult) -> None:
        """Lifecycle hook triggered upon successful outcome derivation of a task."""
        pass

    @abstractmethod
    async def on_terminate(self) -> None:
        """Lifecycle hook triggered before the agent context is wiped and resources freed."""
        pass
