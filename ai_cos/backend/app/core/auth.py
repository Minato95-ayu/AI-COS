from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class UserClaims(BaseModel):
    user_id: str
    role: str
    scopes: list[str]

class IAuthService(ABC):
    """Abstract interface defining the identity boundary of the Operating System."""
    
    @abstractmethod
    async def authenticate(self, credentials: Dict[str, str]) -> Optional[UserClaims]:
        """Verify username/password or token and return identity claims."""
        pass

    @abstractmethod
    def generate_token(self, claims: UserClaims) -> str:
        """Create a cryptographic JWT or token for session tracking."""
        pass

    @abstractmethod
    def verify_token(self, token: str) -> Optional[UserClaims]:
        """Validate session token integrity and extract scopes."""
        pass

class AgentScopeGuard:
    """Middle-tier decorator pattern checking if an actor has access to run an Agent."""
    def __init__(self, required_scope: str):
        self.required_scope = required_scope

    async def __call__(self, claims: UserClaims) -> bool:
        if "admin" in claims.scopes:
            return True
        return self.required_scope in claims.scopes\n