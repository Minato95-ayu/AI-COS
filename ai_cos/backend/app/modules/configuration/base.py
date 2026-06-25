from abc import ABC
from .interfaces import IConfiguration
from .config import SystemSettingsConfig
from .repository import ConfigurationRepository

class BaseConfiguration(IConfiguration, ABC):
    """Abstract base config layer wrapping defaults and system override locks."""
    
    def __init__(self, config: SystemSettingsConfig, repository: ConfigurationRepository):
        self.config = config
        self.repository = repository

    def get_env_variable(self, key: str, default: str) -> str:
        """Abstract environment variable fetch wrapper."""
        import os
        return os.getenv(key, default)
