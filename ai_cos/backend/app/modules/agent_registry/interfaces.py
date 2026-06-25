from abc import ABC, abstractmethod
from typing import List, Optional
from .models import AgentProfile

class IAgentRegistry(ABC):
    """Interface defining operations for registering and discovering specialized corporate agents."""
    
    @abstractmethod
    async def register_agent(self, agent: AgentProfile) -> AgentProfile:
        """Add a new specialized agent capability to the operating system."""
        pass

    @abstractmethod
    async def deregister_agent(self, agent_id: str) -> bool:
        """Remove an agent from the pool of active workers."""
        pass

    @abstractmethod
    async def get_agent(self, agent_id: str) -> Optional[AgentProfile]:
        """Fetch an agent configuration by ID."""
        pass

    @abstractmethod
    async def list_agents(self, capability: Optional[str] = None) -> List[AgentProfile]:
        """Find agents matching specific operational capabilities."""
        pass
