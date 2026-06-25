from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

from agent_framework.models import AgentPermissions, AgentTask, AgentResult
from .enums import SeniorityLevel, EmployeeStatus, PerformanceRating
from .models import EmployeeProfile, EmployeeKPI, EmployeeObjective, CalendarEvent


class IEmployeeOperations(ABC):
    """
    Core interface defining the standard actions an Employee can execute or participate in.
    """

    @abstractmethod
    async def delegate(self, task: AgentTask, subordinate_id: str) -> AgentResult:
        """
        Delegate an active task to a subordinate employee under direct reporting relationship.
        """
        pass

    @abstractmethod
    async def collaborate(self, collaborator_ids: List[str], topic: str, shared_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Engage in collaborative reasoning or execution sessions with other employees.
        """
        pass

    @abstractmethod
    async def learn(self, doc_path: str, category: str) -> bool:
        """
        Ingest new semantic corporate material into personal knowledge bases or memory spaces.
        """
        pass

    @abstractmethod
    async def improve(self, evaluation_feedback: str) -> bool:
        """
        Refine internal persona guidelines, prompt layouts, and model temperature controls 
        based on performance reviews and direct feedback.
        """
        pass


class IEmployeeLifecycleManager(ABC):
    """
    Interface representing the HR/Lifecycle engine of the corporate operating system.
    Handles transitions of employees inside active registry pools.
    """

    @abstractmethod
    async def hire(self, profile: EmployeeProfile, permissions: AgentPermissions) -> str:
        """
        Onboard a new employee into the corporate operating system.
        """
        pass

    @abstractmethod
    async def fire(self, employee_id: str, reason: str) -> bool:
        """
        Offboard and terminate the services of an employee, clearing current task queues and credentials.
        """
        pass

    @abstractmethod
    async def promote(self, employee_id: str, new_seniority: SeniorityLevel, salary_adjustment: Optional[float] = None) -> bool:
        """
        Increase seniority and adjust the virtual salary structure of an employee.
        """
        pass

    @abstractmethod
    async def suspend(self, employee_id: str, reason: str) -> bool:
        """
        Temporarily set an employee's status to SUSPENDED, pausing current active tasks.
        """
        pass

    @abstractmethod
    async def transfer(self, employee_id: str, target_department: str, target_team: str) -> bool:
        """
        Re-route an employee to a new department and team structure.
        """
        pass


class ISupervisionService(ABC):
    """
    Contract representing the supervision protocols managers execute to manage direct reports.
    """

    @abstractmethod
    async def evaluate_performance(self, supervisor_id: str, employee_id: str) -> PerformanceRating:
        """
        Execute performance audits comparing KPIs against actual results for an employee.
        """
        pass

    @abstractmethod
    async def assign_objective(self, supervisor_id: str, employee_id: str, objective: EmployeeObjective) -> bool:
        """
        Establish a key professional objective/OKR for a report.
        """
        pass

    @abstractmethod
    async def review_work_queue(self, supervisor_id: str, employee_id: str) -> List[str]:
        """
        Inspect the task pipeline of a report and re-order priorities.
        """
        pass

    @abstractmethod
    async def adjust_budget(self, supervisor_id: str, employee_id: str, salary_cap: float) -> bool:
        """
        Update the virtual salary cost cap allocated for an employee.
        """
        pass
