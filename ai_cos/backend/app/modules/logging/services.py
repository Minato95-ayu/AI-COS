from .base import BaseLogging
from .models import LogEntry, AuditLog

class LoggingService(BaseLogging):
    """Concrete decoupled Logging service mapping events to outputs."""
    
    async def write_log(self, entry: LogEntry) -> None:
        formatted = self.format_json_message(entry.level, entry.message, entry.trace_id)
        if self.config.enable_stdout_logs:
            print(formatted)
        await self.repository.store_log(entry)

    async def commit_audit_trail(self, audit: AuditLog) -> None:
        # Non-repudiation audit pipeline routing
        await self.repository.store_audit(audit)
