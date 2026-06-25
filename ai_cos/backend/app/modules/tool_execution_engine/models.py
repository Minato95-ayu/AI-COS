from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from modules.tool_execution_engine.enums import ToolExecutionStatus, ToolPermissionLevel, SandboxMode, HealthStatus

class ToolPermission(BaseModel):
    """Specifies permission access rules for an individual tool or principal."""
    permission_id: str = Field(default_factory=lambda: "")
    principal_id: str = Field(default="")
    tool_name: str = Field(default="")
    level: ToolPermissionLevel = Field(default=ToolPermissionLevel.READ)
    allowed_arguments: List[str] = Field(default_factory=list)  # Specific parameter filters (e.g. ['path'])
    denied_arguments: List[str] = Field(default_factory=list)   # Parameter blocklists (e.g. ['rm -rf'])
    expires_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ToolPolicy(BaseModel):
    """Enterprise policy governing execution environment requirements."""
    policy_id: str = Field(default="")
    name: str = Field(default="")
    allowed_sandboxes: List[SandboxMode] = Field(default_factory=list)
    require_approval_above_duration_sec: float = Field(default=30.0)
    enforce_argument_regex: Optional[str] = Field(default=None)
    max_memory_limit_mb: int = Field(default=512)
    max_disk_limit_mb: int = Field(default=1024)
    network_access_allowed: bool = Field(default=False)
    whitelist_domains: List[str] = Field(default_factory=list)

class ToolInvocation(BaseModel):
    """Captures the parameters of a scheduled or active tool call execution."""
    invocation_id: str = Field(default="")
    tool_name: str = Field(default="")
    arguments: Dict[str, Any] = Field(default_factory=dict)
    invoker_id: str = Field(default="")
    trace_id: str = Field(default="")
    requested_at: datetime = Field(default_factory=datetime.utcnow)

class ToolResult(BaseModel):
    """The formal structure returned by any tool execution, standardized across OS adapters."""
    invocation_id: str = Field(default="")
    status: ToolExecutionStatus = Field(default=ToolExecutionStatus.PENDING)
    output_data: Optional[Dict[str, Any]] = Field(default=None)
    stdout: Optional[str] = Field(default="")
    stderr: Optional[str] = Field(default="")
    exit_code: int = Field(default=0)
    duration_seconds: float = Field(default=0.0)
    error_message: Optional[str] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)

class ToolContext(BaseModel):
    """Contextual metadata passed during a tool invocation containing permissions, scope and tokens."""
    trace_id: str = Field(default="")
    session_id: str = Field(default="")
    sandbox_mode: SandboxMode = Field(default=SandboxMode.NONE)
    permissions: List[ToolPermission] = Field(default_factory=list)
    policy: Optional[ToolPolicy] = Field(default=None)
    cancellation_token_id: str = Field(default="")
    workspace_path: str = Field(default="")
    env_overrides: Dict[str, str] = Field(default_factory=dict)

class ToolMetrics(BaseModel):
    """Telemetry structure tracking resource utilization and run statistics for analytics."""
    tool_name: str = Field(default="")
    total_calls: int = Field(default=0)
    total_successes: int = Field(default=0)
    total_failures: int = Field(default=0)
    total_timeouts: int = Field(default=0)
    average_duration_seconds: float = Field(default=0.0)
    peak_memory_mb: float = Field(default=0.0)
    bytes_written: int = Field(default=0)
    last_executed_at: Optional[datetime] = Field(default=None)

class ToolHealth(BaseModel):
    """Live diagnostic snapshot of an OS tool's availability and host status."""
    tool_name: str = Field(default="")
    status: HealthStatus = Field(default=HealthStatus.UNKNOWN)
    latency_ms: float = Field(default=0.0)
    dependency_checks: Dict[str, bool] = Field(default_factory=dict) # e.g. {"docker_daemon": True, "python_bin": True}
    last_checked_at: datetime = Field(default_factory=datetime.utcnow)
    diagnostic_message: Optional[str] = Field(default=None)

class ToolAudit(BaseModel):
    """Chronological immutable audit log entry captured for every tool invocation."""
    audit_id: str = Field(default="")
    trace_id: str = Field(default="")
    tool_name: str = Field(default="")
    invoker_id: str = Field(default="")
    sandbox_mode: SandboxMode = Field(default=SandboxMode.NONE)
    arguments_hash: str = Field(default="")  # Cryptographic hash of scrubbed args for compliance
    policy_id: str = Field(default="")
    execution_status: ToolExecutionStatus = Field(default=ToolExecutionStatus.PENDING)
    exit_code: int = Field(default=0)
    duration_seconds: float = Field(default=0.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    security_verdict: str = Field(default="ALLOWED") # ALLOWED, DENIED, ELEVATED
