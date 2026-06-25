from pydantic_settings import BaseSettings

class ModelConfigSettings(BaseSettings):
    """Local Model Manager Parameters Configuration."""
    ollama_api_url: str = "http://localhost:11434"
    max_vram_allocation_gb: float = 16.0
    fallback_cloud_model: str = "gemini-1.5-pro"

    model_config = {
        "env_prefix": "MODEL_MANAGER_",
        "extra": "ignore"
    }
