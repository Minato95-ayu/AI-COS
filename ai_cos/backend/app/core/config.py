import os
from typing import Optional
from pydantic import Field, PostgresDsn, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

class DatabaseSettings(BaseSettings):
    """PostgreSQL configuration schemas and validation."""
    DATABASE_URL: Optional[PostgresDsn] = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/aicos",
        validation_alias="DATABASE_URL"
    )

class RedisSettings(BaseSettings):
    """Redis high-throughput queue and state lock configuration."""
    REDIS_URL: Optional[RedisDsn] = Field(
        default="redis://localhost:6379/0",
        validation_alias="REDIS_URL"
    )

class OllamaSettings(BaseSettings):
    """Local model integration parameters."""
    OLLAMA_HOST: str = Field(default="http://localhost:11434", validation_alias="OLLAMA_HOST")
    DEFAULT_MODEL: str = Field(default="llama3.1:8b", validation_alias="OLLAMA_DEFAULT_MODEL")
    EMBEDDING_MODEL: str = Field(default="nomic-embed-text", validation_alias="OLLAMA_EMBED_MODEL")

class Settings(BaseSettings):
    """AI Company Operating System Central Config."""
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "AI Company Operating System (AI-COS)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Modules Config
    db: DatabaseSettings = DatabaseSettings()
    redis: RedisSettings = RedisSettings()
    ollama: OllamaSettings = OllamaSettings()
    
    # OS Operational Boundaries
    MAX_AGENT_RECURSION_DEPTH: int = 10
    GLOBAL_AGENT_CONCURRENCY_LIMIT: int = 250
    WORKSPACE_ROOT: str = "./run/workspaces"
    LOG_LEVEL: str = "INFO"

# Centralized instantiated configuration singleton
settings = Settings()\n