from pydantic_settings import BaseSettings

class ToolConfig(BaseSettings):
    """Tool Catalog configurations."""
    max_tool_execution_timeout_ms: int = 5000
    sanitize_inputs: bool = True

    model_config = {
        "env_prefix": "TOOL_MANAGER_",
        "extra": "ignore"
    }
