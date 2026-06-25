from pydantic_settings import BaseSettings

class AuthConfig(BaseSettings):
    """Cryptographic and JWT boundary parameters settings."""
    jwt_secret_signing_key: str = "super_secure_cos_default_token_signing_key"
    token_expiration_seconds: int = 1800

    model_config = {
        "env_prefix": "AUTH_",
        "extra": "ignore"
    }
