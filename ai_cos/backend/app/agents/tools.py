from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel

class ToolSpec(BaseModel):
    name: str
    description: str
    parameters_schema: Dict[str, Any]
    is_dangerous: bool = False
    timeout_seconds: int = 30

class BaseTool(ABC):
    """Abstract baseline pattern for any physical action capable by an agent."""
    def __init__(self, spec: ToolSpec):
        self.spec = spec

    @abstractmethod
    async def execute(self, arguments: Dict[str, Any], context: Dict[str, Any]) -> Any:
        pass

class IToolRegistry(ABC):
    """Catalog holding valid registered system and user-defined tools."""
    
    @abstractmethod
    def register_tool(self, tool: BaseTool) -> None:
        pass

    @abstractmethod
    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        pass

    @abstractmethod
    async def invoke_guarded(self, tool_name: str, args: Dict[str, Any], ctx: Dict[str, Any]) -> Dict[str, Any]:
        pass\n