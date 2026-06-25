from typing import Any, AsyncGenerator
from .base import BaseDatabase

class DatabaseService(BaseDatabase):
    """Concrete database pooler wrapper coordinating async transaction blocks."""
    
    async def initialize_pool(self) -> None:
        conn = self.format_connection_string()
        print(f"[Database DB] Initializing connection pool with target: {conn}")
        await self.repository.initialize_pool_client()

    async def get_async_session(self) -> AsyncGenerator[Any, None]:
        print("[Database DB] Provisioning scoped transaction session.")
        yield "scaffold_async_session_instance"

    async def check_db_health(self) -> bool:
        return await self.repository.execute_ping()
