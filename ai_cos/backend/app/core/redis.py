from abc import ABC, abstractmethod
from typing import Optional, Any
import redis.asyncio as aioredis
from .config import settings

class IRedisClient(ABC):
    """Abstract interface for fast caching, active message queues, and shared memory."""
    
    @abstractmethod
    async def get(self, key: str) -> Optional[str]:
        pass

    @abstractmethod
    async def set(self, key: str, value: str, expire_seconds: Optional[int] = None) -> bool:
        pass

    @abstractmethod
    async def acquire_lock(self, lock_name: str, acquire_timeout: int = 10, lock_timeout: int = 60) -> Optional[str]:
        """Obtain a distributed lock token to prevent agent racing conditions."""
        pass

    @abstractmethod
    async def release_lock(self, lock_name: str, identifier: str) -> bool:
        """Safely release the distributed lock if the token matches."""
        pass

class RedisClient(IRedisClient):
    """Production Redis Adapter mapping abstract caching and locking onto native asyncio commands."""
    def __init__(self):
        self.pool = aioredis.ConnectionPool.from_url(
            str(settings.redis.REDIS_URL),
            max_connections=50,
            decode_responses=True
        )

    def get_redis(self) -> aioredis.Redis:
        return aioredis.Redis(connection_pool=self.pool)

    async def get(self, key: str) -> Optional[str]:
        async with self.get_redis() as r:
            return await r.get(key)

    async def set(self, key: str, value: str, expire_seconds: Optional[int] = None) -> bool:
        async with self.get_redis() as r:
            return await r.set(key, value, ex=expire_seconds)

    async def acquire_lock(self, lock_name: str, acquire_timeout: int = 10, lock_timeout: int = 60) -> Optional[str]:
        pass

    async def release_lock(self, lock_name: str, identifier: str) -> bool:
        pass\n