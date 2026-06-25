from pydantic_settings import BaseSettings

class TaskRouterConfig(BaseSettings):
    """Task Router Local Configuration."""
    affinity_match_threshold: float = 0.75
    enable_dynamic_re_routing: bool = True

    model_config = {
        "env_prefix": "TASK_ROUTER_",
        "extra": "ignore"
    }
