from pydantic import BaseModel, Field
from typing import List, Dict, Any

class RouteDefinition(BaseModel):
    path: str
    http_method: str
    target_handler: str
    is_protected: bool = True

class ApiGatewayConfig(BaseModel):
    host_bind: str = "0.0.0.0"
    port_bind: int = 3000
    route_definitions: List[RouteDefinition] = Field(default_factory=dict)
