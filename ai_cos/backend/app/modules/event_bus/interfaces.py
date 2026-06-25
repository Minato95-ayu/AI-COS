from abc import ABC, abstractmethod
from typing import Callable, Coroutine, Any
from .models import SystemEvent

class IEventBus(ABC):
    """Decoupled Event Bus enabling inter-agent messaging and state changes alerts."""
    
    @abstractmethod
    async def publish(self, event: SystemEvent) -> None:
        """Publish an event stream message to any active subscriber hooks."""
        pass

    @abstractmethod
    async def subscribe(self, topic: str, handler: Callable[[SystemEvent], Coroutine[Any, Any, None]]) -> None:
        """Register a callback function to handle events under a topic."""
        pass
