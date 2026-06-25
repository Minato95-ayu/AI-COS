from abc import ABC, abstractmethod
from typing import List, Dict, Any
from .models import MCPServerConfig, MCPResource, MCPToolDefinition

class IMCPIntegration(ABC):
    """Integrates Model Context Protocol (MCP) clients and servers for universal platform interfaces."""
    
    @abstractmethod
    async def connect_mcp_server(self, config: MCPServerConfig) -> bool:
        """Register and handshake with an external Model Context Protocol server."""
        pass

    @abstractmethod
    async def fetch_resources(self, server_id: str) -> List[MCPResource]:
        """Retrieve uniform resource structures from a registered MCP session."""
        pass

    @abstractmethod
    async def invoke_mcp_tool(self, server_id: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Dispatch a tool request through the MCP transport layer."""
        pass
