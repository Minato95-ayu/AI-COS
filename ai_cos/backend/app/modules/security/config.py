from pydantic_settings import BaseSettings

class SecurityConfig(BaseSettings):
    """System guardrails constraints."""
    enable_pii_scanner: bool = True
    block_severe_violations: bool = True
    guardrails_host: str = "localhost"

    model_config = {
        "env_prefix": "SECURITY_",
        "extra": "ignore"
    }
