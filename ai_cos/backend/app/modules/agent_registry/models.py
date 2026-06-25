from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class AgentStatus(str, Enum):
    IDLE = "idle"
    BUSY = "busy"
    OFFLINE = "offline"

class AgentCapability(BaseModel):
    name: str
    description: str
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)

class AgentProfile(BaseModel):
    agent_id: str
    name: str
    role: str
    department_id: str
    status: AgentStatus = AgentStatus.IDLE
    capabilities: List[AgentCapability] = Field(default_factory=list)
    system_prompt: str
    model_requirement: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
