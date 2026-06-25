from abc import ABC
from .interfaces import ILogging
from .config import LoggingConfig
from .repository import LoggingRepository

class BaseLogging(ILogging, ABC):
    """Handles formatting outputs to terminal consoles or fluentd-type aggregators."""
    
    def __init__(self, config: LoggingConfig, repository: LoggingRepository):
        self.config = config
        self.repository = repository

    def format_json_message(self, level: str, message: str, trace_id: str) -> str:
        """Construct structured log JSON schema string."""
        import json
        import time
        return json.dumps({
            "timestamp": time.time(),
            "level": level,
            "trace_id": trace_id,
            "message": message
        })
