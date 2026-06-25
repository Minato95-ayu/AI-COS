from pydantic_settings import BaseSettings

class MCPConfig(BaseSettings):
    """MCP Integration parameters schema settings."""
    default_mcp_handshake_timeout_ms: int = 1500
    enable_mcp_resource_caching: bool = True

    model_config = {
        "env_prefix": "MCP_",
        "extra": "ignore"
    }
