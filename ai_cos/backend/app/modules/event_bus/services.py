from typing import Callable, Coroutine, Any, Dict, List
from .base import BaseEventBus
from .models import SystemEvent

class EventBusService(BaseEventBus):
    """Concrete decoupled EventBusService delivering state notifications."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._handlers: Dict[str, List[Callable[[SystemEvent], Coroutine[Any, Any, None]]]] = {}

    async def publish(self, event: SystemEvent) -> None:
        self.validate_topic_name(event.topic)
        await self.repository.log_event(event)
        
        # Delivering to local handlers
        if event.topic in self._handlers:
            for handler in self._handlers[event.topic]:
                await handler(event)

    async def subscribe(self, topic: str, handler: Callable[[SystemEvent], Coroutine[Any, Any, None]]) -> None:
        if topic not in self._handlers:
            self._handlers[topic] = []
        self._handlers[topic].append(handler)
