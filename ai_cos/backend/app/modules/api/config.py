from pydantic_settings import BaseSettings
from typing import List

class ApiGatewaySettings(BaseSettings):
    """FastAPI Gateway Bind and safety limits configuration."""
    allowed_origins: List[str] = ["*"]
    rate_limit_per_second: int = 60

    model_config = {
        "env_prefix": "API_GATEWAY_",
        "extra": "ignore"
    }
