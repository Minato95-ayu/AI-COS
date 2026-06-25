from pydantic_settings import BaseSettings

class EventBusConfig(BaseSettings):
    """Event Bus parameters settings."""
    use_redis_pubsub: bool = True
    event_retention_limit: int = 1000

    model_config = {
        "env_prefix": "EVENT_BUS_",
        "extra": "ignore"
    }
