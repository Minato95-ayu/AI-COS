from typing import Dict, Optional
from .models import UserIdentity

class AuthenticationRepository:
    """Data storage mapping secure credential databases and identity profiles."""
    
    def __init__(self):
        self._profiles: Dict[str, UserIdentity] = {
            "admin_user": UserIdentity(
                user_id="admin_user",
                role_name="PlatformAdmin",
                associated_scopes=["admin", "execute_agent"]
            )
        }

    async def fetch_user(self, user_id: str) -> Optional[UserIdentity]:
        return self._profiles.get(user_id)
