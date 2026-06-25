from pydantic_settings import BaseSettings

class SystemSettingsConfig(BaseSettings):
    """Centralized system settings schema parameters configuration."""
    environment: str = "production"
    debug_mode: bool = False
    config_sync_interval_ms: int = 10000

    model_config = {
        "env_prefix": "SYSTEM_CONFIG_",
        "extra": "ignore"
    }
