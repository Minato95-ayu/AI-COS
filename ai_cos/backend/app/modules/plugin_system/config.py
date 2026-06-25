from pydantic_settings import BaseSettings

class PluginConfig(BaseSettings):
    """Local Plugin parameters configuration schema settings."""
    strict_security_signing_check: bool = True
    plugins_directory: str = "./run/plugins"

    model_config = {
        "env_prefix": "PLUGIN_SYSTEM_",
        "extra": "ignore"
    }
