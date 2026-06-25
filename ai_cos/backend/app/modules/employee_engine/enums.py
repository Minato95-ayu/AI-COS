from enum import Enum

class SeniorityLevel(str, Enum):
    """Seniority level representing the tier and corporate standing of the employee."""
    INTERN = "intern"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    PRINCIPAL = "principal"
    EXECUTIVE = "executive"


class EmployeeStatus(str, Enum):
    """Status indicating the operational capacity of the employee."""
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"
    ON_LEAVE = "on_leave"


class AvailabilityStatus(str, Enum):
    """Real-time availability of the employee for new tasks or collaboration."""
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"


class PerformanceRating(str, Enum):
    """Standard evaluation tiers for employee performance reviews."""
    NEEDS_IMPROVEMENT = "needs_improvement"
    MEETS_EXPECTATIONS = "meets_expectations"
    EXCEEDS_EXPECTATIONS = "exceeds_expectations"
    OUTSTANDING = "outstanding"
