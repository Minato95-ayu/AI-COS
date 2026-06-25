from abc import ABC
from .interfaces import IEventBus
from .config import EventBusConfig
from .repository import EventRepository

class BaseEventBus(IEventBus, ABC):
    """Abstract base event bus containing routing topologies."""
    
    def __init__(self, config: EventBusConfig, repository: EventRepository):
        self.config = config
        self.repository = repository

    def validate_topic_name(self, topic: str) -> bool:
        """Enforce semantic topic boundaries."""
        return len(topic) > 3 and "." in topic
