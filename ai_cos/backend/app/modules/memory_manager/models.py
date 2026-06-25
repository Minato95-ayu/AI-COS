from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class MemoryEntry(BaseModel):
    memory_id: str
    trace_id: str
    agent_id: str
    content: str
    embedding: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MemoryContext(BaseModel):
    retrieved_entries: List[MemoryEntry]
    relevance_scores: List[float]
    synthesized_prompt: Optional[str] = None
