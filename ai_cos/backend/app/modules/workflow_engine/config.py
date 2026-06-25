from pydantic_settings import BaseSettings

class WorkflowEngineConfig(BaseSettings):
    """
    Global parameters governing execution pools, concurrent allocations, and checkpoint directories.
    """
    max_concurrent_workflow_executing: int = 5000
    checkpoint_directory: str = "./run/checkpoints"
    enable_parallel_execution_pooling: bool = True
    default_step_timeout_seconds: int = 600

    model_config = {
        "env_prefix": "WORKFLOW_ENGINE_",
        "extra": "ignore"
    }
