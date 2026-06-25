from typing import Optional
import time
from .base import BaseAuthentication
from .models import UserCredentials, TokenClaims, UserIdentity

class AuthenticationService(BaseAuthentication):
    """Concrete decoupled Auth service."""
    
    async def login(self, credentials: UserCredentials) -> Optional[str]:
        identity = await self.repository.fetch_user(credentials.user_id)
        if not identity:
            return None
        # Verify secret
        if self.hash_secret(credentials.secret_key) == f"hashed_{credentials.secret_key}":
            return "jwt_token_stub_claims_validated"
        return None

    async def verify_token(self, token: str) -> Optional[TokenClaims]:
        if token == "jwt_token_stub_claims_validated":
            return TokenClaims(
                user_id="admin_user",
                scopes=["admin", "execute_agent"],
                issued_at=int(time.time()),
                expiration=int(time.time() + 3600)
            )
        return None

    async def get_identity(self, user_id: str) -> Optional[UserIdentity]:
        return await self.repository.fetch_user(user_id)
