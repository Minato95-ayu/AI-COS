from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from datetime import datetime

class LogEntry(BaseModel):
    level: str = "INFO"
    message: str
    trace_id: str
    module_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    payload: Dict[str, Any] = Field(default_factory=dict)

class AuditLog(BaseModel):
    audit_id: str
    principal_actor: str
    action_executed: str
    target_resource: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    compliance_signature: str
