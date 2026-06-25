from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from modules.tool_execution_engine.models import (
    ToolInvocation, 
    ToolResult, 
    ToolContext, 
    ToolPermission, 
    ToolPolicy, 
    ToolMetrics, 
    ToolHealth,
    ToolAudit
)
from modules.tool_execution_engine.enums import HealthStatus

class ToolRegistry(ABC):
    """Governing interface to register, discover, and inspect operational OS tools."""
    
    @abstractmethod
    def register_tool(self, tool: Any) -> None:
        """Register a BaseTool into the central OS kernel registry."""
        pass

    @abstractmethod
    def unregister_tool(self, name: str) -> None:
        """Remove a tool from the registry."""
        pass

    @abstractmethod
    def get_tool(self, name: str) -> Optional[Any]:
        """Retrieve a specific BaseTool instance by name."""
        pass

    @abstractmethod
    def list_tools(self) -> List[Any]:
        """List all active registered tool instances in the registry."""
        pass

    @abstractmethod
    def get_metrics(self, name: str) -> Optional[ToolMetrics]:
        """Fetch cumulative performance metrics for a specific tool."""
        pass

    @abstractmethod
    def get_health(self, name: str) -> ToolHealth:
        """Execute diagnostic checks on a tool and return its current health status."""
        pass


class ToolExecutor(ABC):
    """Enterprise orchestrator responsible for executing tools with guardrails, timeouts, and logging."""

    @abstractmethod
    async def execute(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        """
        Executes a registered tool within the specified context context.
        Must enforce permissions, validate arguments, prepare the sandbox,
        handle retries/timeouts, and output standardized telemetry audit logs.
        """
        pass

    @abstractmethod
    def cancel_execution(self, cancellation_token_id: str) -> bool:
        """Signal and cancel an active, non-blocking asynchronous tool execution thread."""
        pass


class ToolSandbox(ABC):
    """Isolated environment abstraction (e.g. Docker, User directories) to safely run untrusted code."""

    @abstractmethod
    def provision(self, context: ToolContext) -> str:
        """Create and mount the filesystem boundaries and environment variables for the sandbox."""
        pass

    @abstractmethod
    async def run_command(self, command: List[str], env: Dict[str, str], timeout_sec: float) -> ToolResult:
        """Execute a physical command line array inside the container or sandboxed environment."""
        pass

    @abstractmethod
    def teardown(self, context: ToolContext) -> None:
        """Safely destroy containers, directories, and wipe residual memory pages."""
        pass


class ToolScheduler(ABC):
    """Coordinates deferred, cyclic (cron), or delayed tool execution jobs."""

    @abstractmethod
    def schedule_job(self, invocation: ToolInvocation, context: ToolContext, run_at_iso: str) -> str:
        """Schedule a tool call at a specific future ISO-8601 timestamp."""
        pass

    @abstractmethod
    def schedule_recurring_job(self, invocation: ToolInvocation, context: ToolContext, cron_expr: str) -> str:
        """Schedule a tool call on a repeating cron schedule pattern."""
        pass

    @abstractmethod
    def cancel_job(self, job_id: str) -> bool:
        """Unschedule and clean up resources for a registered job."""
        pass


class ToolQueue(ABC):
    """Asynchronous job stream prioritizing and queuing pending tool operations for processing pools."""

    @abstractmethod
    def push(self, invocation: ToolInvocation, context: ToolContext, priority: int = 0) -> str:
        """Enqueue a tool invocation for background workers."""
        pass

    @abstractmethod
    def pop(self) -> Optional[tuple[ToolInvocation, ToolContext]]:
        """Pop the highest-priority pending task from the active queue stream."""
        pass

    @abstractmethod
    def get_queue_size(self) -> int:
        """Return the count of all enqueued, unhandled tasks."""
        pass
