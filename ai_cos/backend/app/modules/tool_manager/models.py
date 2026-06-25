from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters_schema: Dict[str, Any]
    required_clearance_level: str = "default"
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ToolExecutionRequest(BaseModel):
    tool_name: str
    caller_agent_id: str
    arguments: Dict[str, Any] = Field(default_factory=dict)
    transaction_trace_id: str

class ToolExecutionResult(BaseModel):
    tool_name: str
    success: bool
    output: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
