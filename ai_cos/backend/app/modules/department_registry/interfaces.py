from abc import ABC, abstractmethod
from typing import List, Optional
from .models import Department, DepartmentMember

class IDepartmentRegistry(ABC):
    """Interface governing the logical division of corporate domains and agent departmental teams."""
    
    @abstractmethod
    async def create_department(self, department: Department) -> Department:
        """Register a new business division (e.g., Marketing, Sales)."""
        pass

    @abstractmethod
    async def add_agent_to_department(self, member: DepartmentMember) -> bool:
        """Assign a registered agent profile to a department."""
        pass

    @abstractmethod
    async def get_department_agents(self, department_id: str) -> List[DepartmentMember]:
        """Retrieve the list of members assigned to a department."""
        pass
