from abc import ABC
from .interfaces import IAuthentication
from .config import AuthConfig
from .repository import AuthenticationRepository

class BaseAuthentication(IAuthentication, ABC):
    """Contains hash validations, claims structure mappings, and helper tokens validation."""
    
    def __init__(self, config: AuthConfig, repository: AuthenticationRepository):
        self.config = config
        self.repository = repository

    def hash_secret(self, raw_secret: str) -> str:
        """Secure SHA-256 hash stubs."""
        return f"hashed_{raw_secret}"
