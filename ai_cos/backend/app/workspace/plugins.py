from abc import ABC, abstractmethod
from typing import Dict, Any

class IPlugin(ABC):
    """Interface to build interceptor libraries and dynamic custom modules."""
    
    @abstractmethod
    async def on_system_init(self) -> None:
        pass

    @abstractmethod
    async def pre_agent_inference(self, agent_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def post_agent_inference(self, agent_id: str, result: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def on_system_shutdown(self) -> None:
        pass\n