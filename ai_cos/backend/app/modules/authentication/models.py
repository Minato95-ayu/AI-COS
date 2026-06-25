from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class UserCredentials(BaseModel):
    user_id: str
    secret_key: str

class TokenClaims(BaseModel):
    user_id: str
    scopes: List[str] = Field(default_factory=list)
    issued_at: int
    expiration: int

class UserIdentity(BaseModel):
    user_id: str
    role_name: str
    associated_scopes: List[str]
