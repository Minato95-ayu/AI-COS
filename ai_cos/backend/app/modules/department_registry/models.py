from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Department(BaseModel):
    department_id: str
    name: str
    description: str
    manager_agent_id: Optional[str] = None
    parent_department_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class DepartmentMember(BaseModel):
    department_id: str
    agent_id: str
    role_within_dept: str
    access_clearance: str = "default"
