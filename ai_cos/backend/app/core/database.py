from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import settings

# Async driver configuration using asyncpg
engine = create_async_engine(
    str(settings.db.DATABASE_URL),
    echo=False,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    """Abstract declarative base for mapping database entity structures."""
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency injection generator to manage transaction scoping per request."""
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()\n