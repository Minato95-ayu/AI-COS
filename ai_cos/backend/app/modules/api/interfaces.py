from abc import ABC, abstractmethod
from typing import Any
from fastapi import FastAPI

class IAPI(ABC):
    """API Interface for managing Gateway routes mounting, middleware configs, and rate limits."""
    
    @abstractmethod
    def create_application_app(self) -> FastAPI:
        """Instantiate the primary FastAPI application class."""
        pass

    @abstractmethod
    def register_endpoint_routers(self, app: FastAPI) -> None:
        """Attach sub-routers and dynamic platform modules to the HTTP server context."""
        pass
