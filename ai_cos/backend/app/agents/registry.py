from abc import ABC, abstractmethod
from typing import Dict, Any, List, Type, Optional
from pydantic import BaseModel, Field

class AgentProfile(BaseModel):
    agent_id: str
    name: str
    role: str
    department_id: str
    core_competencies: List[str]
    max_token_budget_per_run: int = 50000
    mcp_servers_enabled: List[str] = Field(default_factory=list)
    system_prompt_override: Optional[str] = None

class BaseAgentInstance(ABC):
    """Abstract parent class governing a single instantiated agent runtime thread."""
    def __init__(self, profile: AgentProfile):
        self.profile = profile

    @abstractmethod
    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Main execution engine loop representing one step of the agent's work."""
        pass

class IAgentRegistry(ABC):
    """Central index of all specialized agent profiles across the enterprise OS."""
    
    @abstractmethod
    def register_agent(self, profile: AgentProfile, agent_cls: Type[BaseAgentInstance]) -> None:
        """Register a new model archetype into the central catalog."""
        pass

    @abstractmethod
    def get_agent_profile(self, agent_id: str) -> Optional[AgentProfile]:
        """Retrieve configuration profile of a target agent."""
        pass

    @abstractmethod
    def find_agents_by_skill(self, skill: str) -> List[AgentProfile]:
        """Locate qualified agents with specialized competencies for a given task."""
        pass

    @abstractmethod
    def instantiate_agent(self, agent_id: str) -> BaseAgentInstance:
        """Factory method to load, setup, and instantiate active running contexts."""
        pass\n