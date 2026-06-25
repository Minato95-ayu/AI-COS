from typing import List, Optional
from .base import BaseAgentRegistry
from .models import AgentProfile

class AgentRegistryService(BaseAgentRegistry):
    """Concrete decoupled AgentRegistryService managing discovery and lifecycle stubs."""
    
    async def register_agent(self, agent: AgentProfile) -> AgentProfile:
        self.validate_profile(agent.agent_id)
        await self.repository.save_agent(agent)
        return agent

    async def deregister_agent(self, agent_id: str) -> bool:
        return await self.repository.delete_agent(agent_id)

    async def get_agent(self, agent_id: str) -> Optional[AgentProfile]:
        return await self.repository.get_agent(agent_id)

    async def list_agents(self, capability: Optional[str] = None) -> List[AgentProfile]:
        return await self.repository.list_agents(capability)
