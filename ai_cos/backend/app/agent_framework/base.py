from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any, Optional
from .models import AgentProfile, AgentContext, AgentTask, AgentResult, AgentMetrics, AgentHealth, AgentPermissions
from .interfaces import AgentMemory, AgentCommunication, AgentLifecycle
from .enums import AgentState

class BaseAgent(AgentLifecycle, ABC):
    """
    Abstract Base Class representing any AI Employee inside the corporate OS.
    
    All business roles (CEO, CTO, software engineers, legal compliance, writers, etc.)
    must inherit from this. It guarantees a model-agnostic layer with strict decoupled boundaries.
    """

    def __init__(
        self,
        profile: AgentProfile,
        permissions: AgentPermissions,
        memory: AgentMemory,
        communication: AgentCommunication,
    ):
        self.profile = profile
        self.permissions = permissions
        self.memory = memory
        self.communication = communication
        
        # Runtime components
        self.context = AgentContext()
        self.metrics = AgentMetrics()
        self.health = AgentHealth(status=AgentState.INITIALIZING)
        self.logs: List[str] = []

    @abstractmethod
    async def execute_task(self, task: AgentTask) -> AgentResult:
        """
        The core reasoning loop. Decoupled from specific LLMs (GPT, Qwen, Gemini, Claude).
        Subclasses implement their specific role prompting, thinking, and actions here.
        """
        pass

    def log_activity(self, message: str) -> None:
        """Append runtime transaction telemetry logs."""
        timestamp = datetime.utcnow().isoformat()
        log_entry = f"[{timestamp}] [{self.profile.agent_id}] {message}"
        self.logs.append(log_entry)
        print(log_entry)

    def update_health_status(self, state: AgentState) -> None:
        """Transitions agent state and registers metrics update."""
        self.health.status = state
        self.health.last_heartbeat = datetime.utcnow()
        self.log_activity(f"State transition to: {state.value}")
