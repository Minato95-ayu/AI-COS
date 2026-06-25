import json
import logging
from typing import Dict, Any, Optional
from contextvars import ContextVar

# Thread-safe context variables to keep track of recursive agent calling trees
trace_id_var: ContextVar[Optional[str]] = ContextVar("trace_id", default=None)
agent_id_var: ContextVar[Optional[str]] = ContextVar("agent_id", default=None)

class JsonLogFormatter(logging.Formatter):
    """Custom standard library formatter exporting trace contexts as flat JSON structures."""
    def format(self, record: logging.LogRecord) -> str:
        log_payload: Dict[str, Any] = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
            "trace_id": trace_id_var.get(),
            "agent_id": agent_id_var.get(),
        }
        
        if hasattr(record, "agent_metadata"):
            log_payload["metadata"] = record.agent_metadata
            
        return json.dumps(log_payload)

def configure_system_logging() -> None:
    """Initialize structured logging pipelines for the whole agent stack."""
    handler = logging.StreamHandler()
    handler.setFormatter(JsonLogFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.addHandler(handler)\n