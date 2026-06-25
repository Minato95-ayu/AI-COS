from pydantic_settings import BaseSettings

class TaskPlannerConfig(BaseSettings):
    """Task Planner Module Configuration."""
    max_recursion_depth: int = 15
    enable_greedy_scheduling: bool = True

    model_config = {
        "env_prefix": "TASK_PLANNER_",
        "extra": "ignore"
    }
