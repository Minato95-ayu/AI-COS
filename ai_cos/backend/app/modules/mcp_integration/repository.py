from typing import Dict
from .models import MCPServerConfig

class MCPRepository:
    """Maintains connection strings and transport mappings for active MCP servers."""
    
    def __init__(self):
        self._servers: Dict[str, MCPServerConfig] = {}

    async def save_mcp_server(self, config: MCPServerConfig) -> None:
        self._servers[config.server_id] = config

    async def get_mcp_server(self, server_id: str) -> MCPServerConfig:
        return self._servers.get(server_id)
