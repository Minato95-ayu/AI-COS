from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class IToolManager(ABC):
    """Management layer holding catalogs, validating parameter types, and executing secure tools."""
    
    @abstractmethod
    async def register_tool(self, tool: Any) -> Any:
        """Register a tool schema in the central system registry."""
        pass

    @abstractmethod
    async def execute_tool(self, request: Any) -> Any:
        """Execute a registered tool after checking scope clearances."""
        pass

    @abstractmethod
    async def list_tools(self, target_agent_id: Optional[str] = None) -> List[Any]:
        """List tools matching authorization limits."""
        pass
