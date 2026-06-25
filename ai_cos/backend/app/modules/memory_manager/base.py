from abc import ABC
from .interfaces import IMemoryManager
from .config import MemoryConfig
from .repository import MemoryRepository

class BaseMemoryManager(IMemoryManager, ABC):
    """Base memory engine handling chunk weights, decay intervals, and formats."""
    
    def __init__(self, config: MemoryConfig, repository: MemoryRepository):
        self.config = config
        self.repository = repository

    def apply_decay(self, age_days: int) -> float:
        """Calculate memory relevance degradation over time."""
        return max(0.1, 1.0 - (age_days * self.config.temporal_decay_rate))
