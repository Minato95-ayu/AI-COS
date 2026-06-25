from pydantic_settings import BaseSettings

class LoggingConfig(BaseSettings):
    """Structured logger telemetry variables."""
    log_level: str = "INFO"
    enable_stdout_logs: bool = True
    datadog_agent_host: str = "localhost"

    model_config = {
        "env_prefix": "LOGGING_",
        "extra": "ignore"
    }
