from pydantic_settings import BaseSettings

class AgentRegistryConfig(BaseSettings):
    """Agent registry local configurations."""
    default_heartbeat_timeout_seconds: int = 30
    enable_metrics_reporting: bool = True

    model_config = {
        "env_prefix": "AGENT_REGISTRY_",
        "extra": "ignore"
    }
