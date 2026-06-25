from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator

class IDatabase(ABC):
    """Manages transaction loops, async connection pools, and database integrations."""
    
    @abstractmethod
    async def initialize_pool(self) -> None:
        """Establish non-blocking connection sessions pool to PostgreSQL."""
        pass

    @abstractmethod
    async def get_async_session(self) -> AsyncGenerator[Any, None]:
        """Dependency injector function managing database transaction boundaries."""
        pass

    @abstractmethod
    async def check_db_health(self) -> bool:
        """Return the health status of active connection pooling targets."""
        pass
