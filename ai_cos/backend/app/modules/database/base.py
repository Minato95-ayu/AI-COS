from abc import ABC
from .interfaces import IDatabase
from .config import DatabaseConfig
from .repository import DatabaseRepository

class BaseDatabase(IDatabase, ABC):
    """Encapsulates database configurations, dialect mappings, and session generators."""
    
    def __init__(self, config: DatabaseConfig, repository: DatabaseRepository):
        self.config = config
        self.repository = repository

    def format_connection_string(self) -> str:
        """Generate DB connection string schema mapping."""
        return f"postgresql+asyncpg://{self.config.db_user}:{self.config.db_pass}@{self.config.db_host}:{self.config.db_port}/{self.config.db_name}"
