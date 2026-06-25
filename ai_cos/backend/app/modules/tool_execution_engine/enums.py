from enum import Enum

class ToolExecutionStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"
    TIMEOUT = "TIMEOUT"

class ToolPermissionLevel(str, Enum):
    READ = "READ"
    WRITE = "WRITE"
    EXECUTE = "EXECUTE"
    ADMIN = "ADMIN"

class SandboxMode(str, Enum):
    NONE = "NONE"             # Direct host execution (high trust)
    USER_SPACE = "USER_SPACE" # Dedicated user-space profile or sandbox directory
    DOCKER = "DOCKER"         # Fully isolated micro-container
    GVISOR = "GVISOR"         # Hardened kernel isolation sandboxing

class HealthStatus(str, Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"
