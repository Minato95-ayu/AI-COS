from typing import Dict, List, Optional
from .models import AgentProfile

class AgentRegistryRepository:
    """Data store abstraction managing hundreds of AI agent profile entries."""
    
    def __init__(self):
        self._store: Dict[str, AgentProfile] = {}

    async def save_agent(self, agent: AgentProfile) -> None:
        self._store[agent.agent_id] = agent

    async def delete_agent(self, agent_id: str) -> bool:
        if agent_id in self._store:
            del self._store[agent_id]
            return True
        return False

    async def get_agent(self, agent_id: str) -> Optional[AgentProfile]:
        return self._store.get(agent_id)

    async def list_agents(self, capability: Optional[str] = None) -> List[AgentProfile]:
        all_profiles = list(self._store.values())
        if not capability:
            return all_profiles
        return [
            a for a in all_profiles 
            if any(c.name == capability for c in a.capabilities)
        ]
