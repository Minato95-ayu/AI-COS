from pydantic_settings import BaseSettings

class MemoryConfig(BaseSettings):
    """Memory Engine Parameters Configuration."""
    vector_dimension: int = 1536
    temporal_decay_rate: float = 0.05
    vector_db_host: str = "localhost"

    model_config = {
        "env_prefix": "MEMORY_",
        "extra": "ignore"
    }
