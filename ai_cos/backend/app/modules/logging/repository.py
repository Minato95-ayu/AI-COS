from typing import List
from .models import LogEntry, AuditLog

class LoggingRepository:
    """Tracks running telemetry buffers for fast query metrics."""
    
    def __init__(self):
        self._logs: List[LogEntry] = []
        self._audits: List[AuditLog] = []

    async def store_log(self, entry: LogEntry) -> None:
        self._logs.append(entry)

    async def store_audit(self, audit: AuditLog) -> None:
        self._audits.append(audit)
