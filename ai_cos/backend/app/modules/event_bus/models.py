from pydantic import BaseModel, Field
from typing import Dict, Any
from datetime import datetime

class SystemEvent(BaseModel):
    event_id: str
    topic: str
    source_module: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    payload: Dict[str, Any] = Field(default_factory=dict)
