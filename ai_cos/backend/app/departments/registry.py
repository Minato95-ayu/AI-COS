from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DepartmentProfile(BaseModel):
    department_id: str
    name: str
    manager_agent_id: str  # Escalation router
    member_agent_ids: List[str]
    monthly_budget_cap: float
    current_spend: float = 0.0

class IDepartmentRegistry(ABC):
    """Defines organizational taxonomy rules, reporting lines, and delegation loops."""
    
    @abstractmethod
    def create_department(self, department: DepartmentProfile) -> None:
        pass

    @abstractmethod
    def assign_agent_to_department(self, agent_id: str, department_id: str) -> None:
        pass

    @abstractmethod
    def route_to_department_manager(self, department_id: str, task_context: Dict[str, Any]) -> Dict[str, Any]:
        """Escalate an unhandled task to the head of a department for replanning."""
        pass

    @abstractmethod
    def track_department_expenditure(self, department_id: str, token_cost_usd: float) -> None:
        """Track department financial quotas in high-concurrency systems."""
        pass\n