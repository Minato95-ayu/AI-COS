from typing import List
from .base import BaseDepartmentRegistry
from .models import Department, DepartmentMember

class DepartmentRegistryService(BaseDepartmentRegistry):
    """Decoupled Department Service scaffolding mapping departments to agent profiles."""
    
    async def create_department(self, department: Department) -> Department:
        self.check_department_hierarchy(department.department_id)
        await self.repository.save_department(department)
        return department

    async def add_agent_to_department(self, member: DepartmentMember) -> bool:
        await self.repository.save_member(member)
        return True

    async def get_department_agents(self, department_id: str) -> List[DepartmentMember]:
        return await self.repository.get_members(department_id)
