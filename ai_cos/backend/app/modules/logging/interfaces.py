from abc import ABC, abstractmethod
from typing import Dict, Any
from .models import LogEntry, AuditLog

class ILogging(ABC):
    """Structured telemetry engine tracking execution trace logs, agent queries, and metrics."""
    
    @abstractmethod
    async def write_log(self, entry: LogEntry) -> None:
        """Emit structured JSON transaction trace logs."""
        pass

    @abstractmethod
    async def commit_audit_trail(self, audit: AuditLog) -> None:
        """Write a non-repudiable audit trace event for file/model execution tracking."""
        pass
