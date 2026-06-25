from typing import Dict, List
from .models import Department, DepartmentMember

class DepartmentRegistryRepository:
    """Decoupled repository managing persistent mapping of departments and agent groups."""
    
    def __init__(self):
        self._depts: Dict[str, Department] = {}
        self._members: Dict[str, List[DepartmentMember]] = {}

    async def save_department(self, dept: Department) -> None:
        self._depts[dept.department_id] = dept

    async def save_member(self, member: DepartmentMember) -> None:
        if member.department_id not in self._members:
            self._members[member.department_id] = []
        self._members[member.department_id].append(member)

    async def get_members(self, department_id: str) -> List[DepartmentMember]:
        return self._members.get(department_id, [])
