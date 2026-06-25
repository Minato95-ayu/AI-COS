from typing import List, Dict, Any, Optional
from datetime import datetime

from agent_framework.models import AgentPermissions, AgentTask
from agent_framework.enums import AgentState
from .enums import SeniorityLevel, EmployeeStatus, AvailabilityStatus, PerformanceRating
from .models import EmployeeProfile, EmployeeObjective, EmployeeKPI, CalendarEvent
from .interfaces import IEmployeeLifecycleManager, ISupervisionService
from .base import BaseEmployee


class EmployeeLifecycleManagerImpl(IEmployeeLifecycleManager):
    """
    Standard production-ready implementation of the Employee Lifecycle HR System.
    Manages active employee registry pools, transitions status, and processes promotions.
    """

    def __init__(self):
        # Master repository mapping Employee ID -> Active Employee Instance
        self._active_employees: Dict[str, BaseEmployee] = {}

    def get_employee(self, employee_id: str) -> Optional[BaseEmployee]:
        """Retrieve an active employee instance from the directory."""
        return self._active_employees.get(employee_id)

    def get_all_employees(self) -> List[BaseEmployee]:
        """List all currently active employees registered in the corporate system."""
        return list(self._active_employees.values())

    async def hire(self, employee_instance: BaseEmployee) -> str:
        """
        Onboards and registers a pre-configured Employee instance into the corporate system.
        """
        profile = employee_instance.employee_profile
        emp_id = profile.employee_id
        
        if emp_id in self._active_employees:
            raise ValueError(f"Employee with ID {emp_id} is already onboarded.")

        # Transition status to ACTIVE
        profile.status = EmployeeStatus.ACTIVE
        profile.availability = AvailabilityStatus.AVAILABLE
        employee_instance.update_health_status(AgentState.IDLE)
        
        # Register in master active map
        self._active_employees[emp_id] = employee_instance
        employee_instance.log_activity(f"Successfully hired as {profile.role} in {profile.department} department.")
        
        return emp_id

    async def fire(self, employee_id: str, reason: str) -> bool:
        """
        Terminates the services of an employee and marks them as terminated.
        """
        if employee_id not in self._active_employees:
            raise KeyError(f"Employee ID {employee_id} not found in directory.")

        employee = self._active_employees[employee_id]
        profile = employee.employee_profile
        
        # Mark as terminated and offline
        profile.status = EmployeeStatus.TERMINATED
        profile.availability = AvailabilityStatus.OFFLINE
        profile.current_task_id = None
        profile.work_queue.clear()
        
        employee.update_health_status(AgentState.TERMINATED)
        employee.log_activity(f"Offboarded from corporate OS. Reason: {reason}")
        
        # Remove from active runtime pool
        del self._active_employees[employee_id]
        return True

    async def promote(self, employee_id: str, new_seniority: SeniorityLevel, salary_adjustment: Optional[float] = None) -> bool:
        """
        Elevate seniority level and update virtual payroll cost boundaries.
        """
        if employee_id not in self._active_employees:
            raise KeyError(f"Employee ID {employee_id} not found.")

        employee = self._active_employees[employee_id]
        profile = employee.employee_profile
        
        old_seniority = profile.seniority
        profile.seniority = new_seniority
        
        if salary_adjustment is not None:
            profile.salary_cost = salary_adjustment
            
        employee.log_activity(f"Promoted from {old_seniority.value} to {new_seniority.value}. Budget adjusted.")
        return True

    async def suspend(self, employee_id: str, reason: str) -> bool:
        """
        Suspends an active employee, blocking task routing.
        """
        if employee_id not in self._active_employees:
            raise KeyError(f"Employee ID {employee_id} not found.")

        employee = self._active_employees[employee_id]
        profile = employee.employee_profile
        
        profile.status = EmployeeStatus.SUSPENDED
        profile.availability = AvailabilityStatus.OFFLINE
        
        employee.update_health_status(AgentState.PAUSED)
        employee.log_activity(f"Suspended from active operations. Reason: {reason}")
        return True

    async def transfer(self, employee_id: str, target_department: str, target_team: str) -> bool:
        """
        Reassigns an employee's department and team.
        """
        if employee_id not in self._active_employees:
            raise KeyError(f"Employee ID {employee_id} not found.")

        employee = self._active_employees[employee_id]
        profile = employee.employee_profile
        
        old_dept = profile.department
        old_team = profile.team
        
        profile.department = target_department
        profile.team = target_team
        
        employee.log_activity(f"Transferred from {old_dept}/{old_team} to {target_department}/{target_team}")
        return True


class SupervisionServiceImpl(ISupervisionService):
    """
    Implements manager supervision controls, enabling auditing of reports and KPI tracking.
    """

    def __init__(self, lifecycle_manager: EmployeeLifecycleManagerImpl):
        self.lifecycle_manager = lifecycle_manager

    async def evaluate_performance(self, supervisor_id: str, employee_id: str) -> PerformanceRating:
        """
        Audits performance scores of an employee against active KPIs.
        """
        employee = self.lifecycle_manager.get_employee(employee_id)
        if not employee:
            raise KeyError(f"Employee {employee_id} not found.")

        profile = employee.employee_profile
        
        # Calculate performance based on KPI achievements
        if not profile.kpis:
            return PerformanceRating.MEETS_EXPECTATIONS

        total_achievement = 0.0
        for kpi in profile.kpis:
            if kpi.target > 0:
                achievement = min(1.0, kpi.current / kpi.target)
                total_achievement += achievement
            else:
                total_achievement += 1.0

        avg_achievement = total_achievement / len(profile.kpis)
        
        # Set performance score and map to enum
        profile.performance_score = avg_achievement * 100.0
        
        if avg_achievement >= 0.95:
            rating = PerformanceRating.OUTSTANDING
        elif avg_achievement >= 0.80:
            rating = PerformanceRating.EXCEEDS_EXPECTATIONS
        elif avg_achievement >= 0.60:
            rating = PerformanceRating.MEETS_EXPECTATIONS
        else:
            rating = PerformanceRating.NEEDS_IMPROVEMENT

        employee.log_activity(f"Performance reviewed by manager {supervisor_id}. Rating assigned: {rating.value}")
        return rating

    async def assign_objective(self, supervisor_id: str, employee_id: str, objective: EmployeeObjective) -> bool:
        """
        Binds a target OKR/objective to an employee's objectives list.
        """
        employee = self.lifecycle_manager.get_employee(employee_id)
        if not employee:
            raise KeyError(f"Employee {employee_id} not found.")

        profile = employee.employee_profile
        profile.objectives.append(objective)
        
        employee.log_activity(f"New Objective Assigned by supervisor {supervisor_id}: '{objective.title}'")
        return True

    async def review_work_queue(self, supervisor_id: str, employee_id: str) -> List[str]:
        """
        Allows supervisors to read and audit report work queues.
        """
        employee = self.lifecycle_manager.get_employee(employee_id)
        if not employee:
            raise KeyError(f"Employee {employee_id} not found.")

        return employee.employee_profile.work_queue

    async def adjust_budget(self, supervisor_id: str, employee_id: str, salary_cap: float) -> bool:
        """
        Directly sets the virtual budgetary spend limits on employees.
        """
        employee = self.lifecycle_manager.get_employee(employee_id)
        if not employee:
            raise KeyError(f"Employee {employee_id} not found.")

        employee.employee_profile.salary_cost = salary_cap
        employee.log_activity(f"Salary rate adjusted to {salary_cap} by manager {supervisor_id}.")
        return True
