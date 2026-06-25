from abc import ABC, abstractmethod
from typing import Optional
from .models import UserCredentials, TokenClaims, UserIdentity

class IAuthentication(ABC):
    """Strict operational boundary defining API-key verification and authorization JWT generation."""
    
    @abstractmethod
    async def login(self, credentials: UserCredentials) -> Optional[str]:
        """Verify user identity and generate a cryptographically secure token."""
        pass

    @abstractmethod
    async def verify_token(self, token: str) -> Optional[TokenClaims]:
        """Authenticate a JWT and output authorization scope claims."""
        pass

    @abstractmethod
    async def get_identity(self, user_id: str) -> Optional[UserIdentity]:
        """Query user credentials profile mappings."""
        pass
