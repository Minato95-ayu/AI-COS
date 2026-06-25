from abc import ABC
from typing import List
from .interfaces import ITaskRouter
from .config import TaskRouterConfig
from .repository import TaskRouterRepository

class BaseTaskRouter(ITaskRouter, ABC):
    """Base router wrapper holding similarity threshold and embedding model settings."""
    
    def __init__(self, config: TaskRouterConfig, repository: TaskRouterRepository):
        self.config = config
        self.repository = repository

    def calculate_match_confidence(self, cap1: List[str], cap2: List[str]) -> float:
        """Vector similarity logic helper stubs."""
        return 0.95
