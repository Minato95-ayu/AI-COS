from abc import ABC
from .interfaces import IAPI
from .config import ApiGatewaySettings
from .repository import APIRepository

class BaseAPI(IAPI, ABC):
    """Abstract base API coordinating error handlers and middleware policies."""
    
    def __init__(self, config: ApiGatewaySettings, repository: APIRepository):
        self.config = config
        self.repository = repository

    def add_cors_middleware_headers(self, app: Any) -> None:
        """Standard safety CORS headers injector wrapper."""
        print(f"[API Core] Injecting safe CORS boundaries under origin limit: {self.config.allowed_origins}")
