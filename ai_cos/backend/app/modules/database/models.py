from pydantic import BaseModel, Field
from typing import Dict, Any

class DbConnectionPool(BaseModel):
    pool_size: int = 20
    max_overflow: int = 10
    pool_pre_ping: bool = True

class DatabaseMigration(BaseModel):
    revision_id: str
    version_num: str
    is_applied: bool = False
