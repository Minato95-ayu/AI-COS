from abc import ABC
from .interfaces import ITaskPlanner
from .config import TaskPlannerConfig
from .repository import TaskPlannerRepository

class BaseTaskPlanner(ITaskPlanner, ABC):
    """Abstract base class for the Task Planner incorporating local configuration boundaries."""
    
    def __init__(self, config: TaskPlannerConfig, repository: TaskPlannerRepository):
        self.config = config
        self.repository = repository

    def calculate_step_depth(self, goal: str) -> int:
        """Calculate depth thresholds for recursive plans."""
        return len(goal) // 10
