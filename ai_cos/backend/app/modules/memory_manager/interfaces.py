from abc import ABC, abstractmethod
from typing import List, Dict, Any
from .models import MemoryEntry, MemoryContext

class IMemoryManager(ABC):
    """Multi-tier agent memory engine (semantic vector search, short-term buffers, long-term)."""
    
    @abstractmethod
    async def commit_memory(self, entry: MemoryEntry) -> MemoryEntry:
        """Write a conversation, outcome, or document to the system vector database."""
        pass

    @abstractmethod
    async def retrieve_context(self, query: str, filters: Dict[str, Any], limit: int = 5) -> MemoryContext:
        """Execute semantic retrieval of vector memories to feed system context."""
        pass

    @abstractmethod
    async def purge_memories(self, trace_id: str) -> bool:
        """Clean records linked to a specific session context."""
        pass
