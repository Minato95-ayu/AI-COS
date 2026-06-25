from typing import Dict, List
from .models import ToolDefinition

class ToolRepository:
    """Persistent cache of schemas and ACL mappings for enterprise tools."""
    
    def __init__(self):
        self._catalog: Dict[str, ToolDefinition] = {}

    async def save_tool(self, tool: ToolDefinition) -> None:
        self._catalog[tool.name] = tool

    async def get_tool(self, name: str) -> ToolDefinition:
        return self._catalog.get(name)

    async def all_tools(self) -> List[ToolDefinition]:
        return list(self._catalog.values())
