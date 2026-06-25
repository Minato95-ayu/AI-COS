from pydantic_settings import BaseSettings

class DatabaseConfig(BaseSettings):
    """Local Database parameters settings configurations."""
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "aicos"
    db_user: str = "postgres"
    db_pass: str = "postgres"

    model_config = {
        "env_prefix": "DATABASE_",
        "extra": "ignore"
    }
