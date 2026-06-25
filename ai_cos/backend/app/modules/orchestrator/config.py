from pydantic_settings import BaseSettings

class OrchestratorConfig(BaseSettings):
    """Configuration schema parameters unique to workflow scheduling."""
    max_concurrent_workflows: int = 100
    workflow_timeout_seconds: int = 3600
    enable_auto_retries: bool = True

    model_config = {
        "env_prefix": "ORCHESTRATOR_",
        "extra": "ignore"
    }
