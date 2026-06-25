from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class MemoryItem(BaseModel):
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None
    timestamp: float

class IMemory(ABC):
    """Abstract interface defining the complete grounding loop of an agent."""
    
    @abstractmethod
    async def add_working_context(self, session_id: str, message: Dict[str, Any]) -> None:
        """Append a conversational snippet to temporary sliding short-term buffer."""
        pass

    @abstractmethod
    async def get_working_context(self, session_id: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Retrieve the ordered list of recent working messages."""
        pass

    @abstractmethod
    async def save_episodic_memory(self, agent_id: str, content: str, tags: List[str]) -> str:
        """Persist structured summary in episodic vector memory space."""
        pass

    @abstractmethod
    async def query_semantic_memories(self, agent_id: str, query: str, limit: int = 5) -> List[MemoryItem]:
        """Perform cosine similarity lookup against agent embeddings."""
        pass

    @abstractmethod
    async def clear_all_context(self, session_id: str) -> None:
        """Flush transient state queues."""
        pass\n