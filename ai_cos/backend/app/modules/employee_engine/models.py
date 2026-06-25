from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Import standard Agent Framework models for deep integration and backward compatibility
from agent_framework.models import AgentProfile, AgentPermissions
from .enums import SeniorityLevel, EmployeeStatus, AvailabilityStatus


class EmployeeKPI(BaseModel):
    """Key Performance Indicator representing specific measurable metrics for an employee."""
    name: str = Field(..., description="The name/title of the Key Performance Indicator")
    target: float = Field(..., description="Target threshold or target value")
    current: float = Field(default=0.0, description="Current achieved value")
    unit: str = Field(default="", description="The unit of measurement (e.g., %, count, USD, ms)")
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class EmployeeObjective(BaseModel):
    """Organizational objective or OKR assigned to the employee."""
    objective_id: str = Field(..., description="Unique identifier for the objective")
    title: str = Field(..., description="Title of the objective")
    description: str = Field(..., description="Detailed explanation of the goal")
    progress: float = Field(default=0.0, ge=0.0, le=100.0, description="Percentage progress completed (0-100)")
    target_date: datetime = Field(..., description="Target date for completion")
    is_completed: bool = Field(default=False)


class CalendarEvent(BaseModel):
    """Calendar slot or meeting representing employee time allocations."""
    event_id: str = Field(..., description="Unique ID of the calendar event")
    title: str = Field(..., description="Subject or title of the event")
    start_time: datetime = Field(..., description="Start timestamp of the event")
    end_time: datetime = Field(..., description="End timestamp of the event")
    attendees: List[str] = Field(default_factory=list, description="Employee IDs attending the event")
    description: Optional[str] = Field(None, description="Optional notes or details")


class EmployeeCalendar(BaseModel):
    """Structured calendar tracking scheduled meetings, focus blocks, and events."""
    events: List[CalendarEvent] = Field(default_factory=list, description="List of calendar events")


class EmployeeProfile(AgentProfile):
    """
    Complete schema for any Corporate Employee inside the Operating System.
    Inherits from and extends AgentProfile to preserve backward-compatible architecture.
    """
    employee_id: str = Field(..., description="Clean human or UUID alias matching agent_id")
    team: str = Field(..., description="The team within the department (e.g., Backend, QA, Platform)")
    manager_id: Optional[str] = Field(None, description="Employee ID of the supervisor manager")
    seniority: SeniorityLevel = Field(default=SeniorityLevel.MID, description="Seniority level of the employee")
    certifications: List[str] = Field(default_factory=list, description="Earned certificates and professional credentials")
    preferred_tools: List[str] = Field(default_factory=list, description="IDs of tools this employee prefers to use")
    salary_cost: float = Field(default=0.0, description="Virtual salary cost rate representing budget spend")
    experience_score: float = Field(default=0.0, ge=0.0, le=100.0, description="Virtual experience score reflecting completed scopes")
    reliability_score: float = Field(default=100.0, ge=0.0, le=100.0, description="Score based on task execution success and SLA compliance")
    performance_score: float = Field(default=100.0, ge=0.0, le=100.0, description="Performance evaluation score from peer and manager reviews")
    availability: AvailabilityStatus = Field(default=AvailabilityStatus.AVAILABLE, description="Current availability for scheduling")
    current_task_id: Optional[str] = Field(None, description="ID of the current active task running")
    work_queue: List[str] = Field(default_factory=list, description="Queue of queued task IDs")
    calendar: EmployeeCalendar = Field(default_factory=EmployeeCalendar, description="Structured calendar representing meetings and events")
    knowledge_base: List[str] = Field(default_factory=list, description="Semantic document paths/keys stored in knowledge base")
    kpis: List[EmployeeKPI] = Field(default_factory=list, description="Measurable performance metrics")
    objectives: List[EmployeeObjective] = Field(default_factory=list, description="Assigned professional objectives")
    reports: List[str] = Field(default_factory=list, description="List of Employee IDs reporting to this employee")
    status: EmployeeStatus = Field(default=EmployeeStatus.ACTIVE, description="Current organizational status of the employee")


class CollaborationRequest(BaseModel):
    """Represents a request for collaborative effort between multiple employees."""
    session_id: str = Field(..., description="Unique collaborative session ID")
    requester_id: str = Field(..., description="Employee ID initiating collaboration")
    collaborator_ids: List[str] = Field(..., description="Employee IDs requested to participate")
    topic: str = Field(..., description="Topic or task requiring collaboration")
    shared_context: Dict[str, Any] = Field(default_factory=dict, description="Context variables shared for execution")
