from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MCPResource(BaseModel):
    uri: str
    name: str
    description: Optional[str] = None
    mime_type: Optional[str] = None

class MCPClientSession(ABC):
    """Abstract interface governing client connections to MCP standard endpoints."""
    
    @abstractmethod
    async def connect(self, server_url: str, auth_headers: Dict[str, str]) -> bool:
        pass

    @abstractmethod
    async def discover_resources(self) -> List[MCPResource]:
        pass

    @abstractmethod
    async def fetch_resource(self, uri: str) -> str:
        pass

    @abstractmethod
    async def invoke_mcp_tool(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        pass\n