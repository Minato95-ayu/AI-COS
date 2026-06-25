from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class MCPServerConfig(BaseModel):
    server_id: str
    name: str
    host: str
    port: int
    protocol_version: str = "1.0"

class MCPResource(BaseModel):
    uri: str
    name: str
    mime_type: str
    description: Optional[str] = None

class MCPToolDefinition(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]
