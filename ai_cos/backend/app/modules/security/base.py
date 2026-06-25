from abc import ABC
from .interfaces import ISecurity
from .config import SecurityConfig
from .repository import SecurityRepository

class BaseSecurity(ISecurity, ABC):
    """Wrapper containing default regex filters and safety validation patterns."""
    
    def __init__(self, config: SecurityConfig, repository: SecurityRepository):
        self.config = config
        self.repository = repository

    def contains_pii_pattern(self, prompt: str) -> bool:
        """Scan for emails/SSNs helper stubs."""
        import re
        email_regex = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
        return bool(re.search(email_regex, prompt))
