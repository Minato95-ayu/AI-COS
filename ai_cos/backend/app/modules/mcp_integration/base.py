from abc import ABC
from .interfaces import IMCPIntegration
from .config import MCPConfig
from .repository import MCPRepository

class BaseMCPIntegration(IMCPIntegration, ABC):
    """Abstract class providing connection checks and schemas configuration for MCP transports."""
    
    def __init__(self, config: MCPConfig, repository: MCPRepository):
        self.config = config
        self.repository = repository

    def format_mcp_url(self, host: str, port: int) -> str:
        """Convert target fields to an active protocol string."""
        return f"mcp://{host}:{port}"
