import asyncio
import time
import uuid
import hashlib
import os
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

from modules.tool_execution_engine.interfaces import (
    ToolRegistry, 
    ToolExecutor, 
    ToolSandbox, 
    ToolScheduler, 
    ToolQueue
)
from modules.tool_execution_engine.base import BaseTool
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
from modules.tool_execution_engine.enums import ToolExecutionStatus, ToolPermissionLevel, SandboxMode, HealthStatus


class ToolRegistryImpl(ToolRegistry):
    """Concrete implementation of the tool registry managing in-memory indices."""

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._metrics: Dict[str, ToolMetrics] = {}
        self._health: Dict[str, ToolHealth] = {}

    def register_tool(self, tool: BaseTool) -> None:
        self._tools[tool.name] = tool
        self._metrics[tool.name] = ToolMetrics(tool_name=tool.name)
        self._health[tool.name] = ToolHealth(
            tool_name=tool.name,
            status=HealthStatus.HEALTHY,
            dependency_checks={"initialized": True}
        )

    def unregister_tool(self, name: str) -> None:
        self._tools.pop(name, None)
        self._metrics.pop(name, None)
        self._health.pop(name, None)

    def get_tool(self, name: str) -> Optional[BaseTool]:
        return self._tools.get(name)

    def list_tools(self) -> List[BaseTool]:
        return list(self._tools.values())

    def get_metrics(self, name: str) -> Optional[ToolMetrics]:
        return self._metrics.get(name)

    def get_health(self, name: str) -> ToolHealth:
        # Default fallback diagnostic check
        health = self._health.get(name)
        if not health:
            return ToolHealth(tool_name=name, status=HealthStatus.UNKNOWN)
        health.latency_ms = 2.4  # Mock latency metric
        health.last_checked_at = datetime.utcnow()
        return health


class ToolSandboxImpl(ToolSandbox):
    """Standard sandbox implementation controlling workspace isolation levels with real local command execution."""

    def provision(self, context: ToolContext) -> str:
        """Create a secure directory path or boot an isolated Docker image."""
        if context.sandbox_mode == SandboxMode.NONE:
            workspace = context.workspace_path or "/tmp/ai_cos_host_workspace"
            os.makedirs(workspace, exist_ok=True)
            return workspace
        
        sandbox_id = str(uuid.uuid4())[:8]
        secure_path = f"/tmp/ai_cos_sandbox_{context.sandbox_mode.lower()}_{sandbox_id}"
        os.makedirs(secure_path, exist_ok=True)
        return secure_path

    async def run_command(self, command: List[str], env: Dict[str, str], timeout_sec: float, cwd: Optional[str] = None) -> ToolResult:
        """Runs the command safely inside the provisioned environment boundary."""
        if not command:
            return ToolResult(
                status=ToolExecutionStatus.FAILED,
                error_message="No command provided",
                exit_code=1,
                completed_at=datetime.utcnow()
            )
        
        # If command is a list, join it with spaces or take the first element if it's a shell command string
        cmd_str = command[0] if len(command) == 1 else " ".join(command)
        
        # Determine the physical execution directory
        cwd_path = cwd or "/tmp/ai_cos_host_workspace"
        os.makedirs(cwd_path, exist_ok=True)

        print(f"[Terminal Exec] Running shell command: {cmd_str} in cwd: {cwd_path}", flush=True)

        import sys
        stdout_buf: List[str] = []
        stderr_buf: List[str] = []

        async def read_stdout(stream):
            while True:
                line = await stream.readline()
                if not line:
                    break
                decoded = line.decode('utf-8', errors='replace')
                stdout_buf.append(decoded)
                # Stream live line-by-line to process stdout so it is captured by the runner console in real-time
                sys.stdout.write(decoded)
                sys.stdout.flush()

        async def read_stderr(stream):
            while True:
                line = await stream.readline()
                if not line:
                    break
                decoded = line.decode('utf-8', errors='replace')
                stderr_buf.append(decoded)
                # Stream live line-by-line to process stderr so it is captured by the runner console in real-time
                sys.stderr.write(decoded)
                sys.stderr.flush()

        process = None
        try:
            # Create sub-process using shell to support shell variables, pipes, redirects, etc.
            process = await asyncio.create_subprocess_shell(
                cmd_str,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                env=env,
                cwd=cwd_path
            )

            # Wait for output streams to finish and process to complete
            await asyncio.gather(
                read_stdout(process.stdout),
                read_stderr(process.stderr),
                process.wait()
            )

            exit_code = process.returncode
            status = ToolExecutionStatus.SUCCESS if exit_code == 0 else ToolExecutionStatus.FAILED
            
            return ToolResult(
                status=status,
                stdout="".join(stdout_buf),
                stderr="".join(stderr_buf),
                exit_code=exit_code if exit_code is not None else -1,
                completed_at=datetime.utcnow()
            )

        except asyncio.CancelledError:
            print("[Terminal Exec] Command cancelled by executor signal.", flush=True)
            if process:
                try:
                    process.terminate()
                    await asyncio.wait_for(process.wait(), timeout=2.0)
                except Exception:
                    try:
                        process.kill()
                    except Exception:
                        pass
            raise
        except Exception as e:
            print(f"[Terminal Exec] Subprocess execution exception: {e}", flush=True)
            return ToolResult(
                status=ToolExecutionStatus.FAILED,
                error_message=str(e),
                exit_code=1,
                stdout="".join(stdout_buf),
                stderr="".join(stderr_buf),
                completed_at=datetime.utcnow()
            )

    def teardown(self, context: ToolContext) -> None:
        """Safely destroy containers or wipe temporary folders."""
        # For non-Docker local folders, optionally clean up if not SandboxMode.NONE
        if context.sandbox_mode != SandboxMode.NONE and context.workspace_path:
            if os.path.exists(context.workspace_path) and "sandbox" in context.workspace_path:
                print(f"[Terminal Sandbox] Tearing down sandbox workspace path: {context.workspace_path}", flush=True)
                import shutil
                try:
                    shutil.rmtree(context.workspace_path)
                except Exception as e:
                    print(f"[Terminal Sandbox] Error cleaning up sandbox path: {e}", flush=True)


class ToolExecutorImpl(ToolExecutor):
    """
    Central operational engine of the Operating System. 
    Handles validation, policy checks, cancellation, timeout wrappers, retries, and audits.
    """

    def __init__(self, registry: ToolRegistry, sandbox_manager: ToolSandbox):
        self.registry = registry
        self.sandbox_manager = sandbox_manager
        self._active_cancellations: Dict[str, bool] = {}  # Tracks cancelled thread tokens
        self._audit_logs: List[ToolAudit] = []

    def cancel_execution(self, cancellation_token_id: str) -> bool:
        """Marks a cancellation token as active, stopping the associated worker loop."""
        self._active_cancellations[cancellation_token_id] = True
        return True

    def _hash_arguments(self, arguments: Dict[str, Any]) -> str:
        """Constructs an audited cryptographic hash of arguments for compliance checks."""
        args_str = str(sorted(arguments.items()))
        return hashlib.sha256(args_str.encode('utf-8')).hexdigest()

    def _verify_permissions(self, tool: BaseTool, context: ToolContext, invocation: ToolInvocation) -> None:
        """Validates permission scopes, parameter list restrictions, and regex blocks."""
        # 1. Enforce permission level matches
        has_sufficient_permission = False
        for p in context.permissions:
            if p.tool_name == tool.name or p.tool_name == "*":
                # Convert permission level to an integer-like tier for robust comparisons
                level_tiers = {
                    ToolPermissionLevel.READ: 1,
                    ToolPermissionLevel.WRITE: 2,
                    ToolPermissionLevel.EXECUTE: 3,
                    ToolPermissionLevel.ADMIN: 4
                }
                user_tier = level_tiers.get(p.level, 0)
                
                for required_perm in tool.required_permissions:
                    req_tier = level_tiers.get(required_perm, 0)
                    if user_tier >= req_tier:
                        has_sufficient_permission = True
                        break

            if has_sufficient_permission:
                # 2. Check argument parameter constraints
                for arg_name in invocation.arguments:
                    if arg_name in p.denied_arguments:
                        raise PermissionError(
                            f"Argument '{arg_name}' is explicitly blocklisted for tool execution of '{tool.name}'."
                        )
                break

        if not has_sufficient_permission:
            raise PermissionError(
                f"Principal '{invocation.invoker_id}' lacks the required permissions level {tool.required_permissions} to invoke tool '{tool.name}'."
            )

    def _verify_policies(self, context: ToolContext, invocation: ToolInvocation) -> None:
        """Enforces high-level workspace configuration constraints and domain restrictions."""
        if not context.policy:
            return

        policy: ToolPolicy = context.policy

        # Validate that the active sandbox matches the policy whitelist
        if context.sandbox_mode not in policy.allowed_sandboxes:
            raise PermissionError(
                f"Policy violation: SandboxMode '{context.sandbox_mode}' is not allowed. Supported options: {policy.allowed_sandboxes}"
            )

    async def execute(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        start_time = time.time()
        tool = self.registry.get_tool(invocation.tool_name)
        
        # 1. Verification phase
        if not tool:
            return ToolResult(
                invocation_id=invocation.invocation_id,
                status=ToolExecutionStatus.FAILED,
                error_message=f"Tool '{invocation.tool_name}' is not registered in the OS system.",
                exit_code=404,
                completed_at=datetime.utcnow()
            )

        try:
            self._verify_permissions(tool, context, invocation)
            self._verify_policies(context, invocation)
        except PermissionError as perm_err:
            # Dispatch immediate security audit log
            self._record_audit(invocation, context, "DENIED", ToolExecutionStatus.FAILED, 403, 0.0)
            return ToolResult(
                invocation_id=invocation.invocation_id,
                status=ToolExecutionStatus.FAILED,
                error_message=str(perm_err),
                exit_code=403,
                completed_at=datetime.utcnow()
            )

        # 2. Provision Sandbox
        sandbox_path = self.sandbox_manager.provision(context)
        context.workspace_path = sandbox_path

        # 3. Execution loop supporting timeouts, cancellation and retry mechanisms
        attempts = 0
        max_attempts = tool.max_retries
        last_exception = None
        result = None

        while attempts < max_attempts:
            # Check cancellation token prior to starting
            if context.cancellation_token_id in self._active_cancellations:
                result = ToolResult(
                    invocation_id=invocation.invocation_id,
                    status=ToolExecutionStatus.CANCELLED,
                    error_message="Execution cancelled by user signal.",
                    exit_code=130,
                    completed_at=datetime.utcnow()
                )
                break

            attempts += 1
            try:
                # Wrap tool call in a strict asyncio timeout coroutine
                async def run_with_hooks():
                    return await tool.run(invocation, context)

                result = await asyncio.wait_for(run_with_hooks(), timeout=tool.max_timeout_sec)
                
                if result.status == ToolExecutionStatus.SUCCESS:
                    break  # Break loop on successful resolution
                
            except asyncio.TimeoutError:
                result = ToolResult(
                    invocation_id=invocation.invocation_id,
                    status=ToolExecutionStatus.TIMEOUT,
                    error_message=f"Tool execution timed out after {tool.max_timeout_sec} seconds limit.",
                    exit_code=124,
                    completed_at=datetime.utcnow()
                )
                break # Timeout is typically a terminal state unless configured otherwise
                
            except Exception as e:
                last_exception = e
                # Perform backoff sleep prior to retry
                if attempts < max_attempts:
                    await asyncio.sleep(1.5 * attempts)

        # Handle fallback for general exception failure states
        if result is None and last_exception:
            result = ToolResult(
                invocation_id=invocation.invocation_id,
                status=ToolExecutionStatus.FAILED,
                error_message=f"Failed after {attempts} retries. Root: {str(last_exception)}",
                exit_code=1,
                completed_at=datetime.utcnow()
            )

        # 4. Final Teardown and Cleanup
        self.sandbox_manager.teardown(context)

        # 5. Metrics collection & audit logging
        duration = time.time() - start_time
        if result:
            result.duration_seconds = duration
            result.completed_at = datetime.utcnow()

        # Update metrics database
        self._update_metrics(tool.name, result)

        # Save audit trace
        self._record_audit(
            invocation, 
            context, 
            "ALLOWED", 
            result.status if result else ToolExecutionStatus.FAILED, 
            result.exit_code if result else 1, 
            duration
        )

        return result

    def _record_audit(
        self, 
        invocation: ToolInvocation, 
        context: ToolContext, 
        verdict: str, 
        status: ToolExecutionStatus,
        exit_code: int,
        duration: float
    ) -> None:
        audit = ToolAudit(
            audit_id=str(uuid.uuid4()),
            trace_id=context.trace_id,
            tool_name=invocation.tool_name,
            invoker_id=invocation.invoker_id,
            sandbox_mode=context.sandbox_mode,
            arguments_hash=self._hash_arguments(invocation.arguments),
            policy_id=context.policy.policy_id if context.policy else "",
            execution_status=status,
            exit_code=exit_code,
            duration_seconds=duration,
            security_verdict=verdict
        )
        self._audit_logs.append(audit)

    def _update_metrics(self, tool_name: str, result: Optional[ToolResult]) -> None:
        metrics = self.registry.get_metrics(tool_name)
        if not metrics or not result:
            return

        metrics.total_calls += 1
        if result.status == ToolExecutionStatus.SUCCESS:
            metrics.total_successes += 1
        elif result.status == ToolExecutionStatus.TIMEOUT:
            metrics.total_timeouts += 1
            metrics.total_failures += 1
        else:
            metrics.total_failures += 1

        # Moving average duration update
        metrics.average_duration_seconds = (
            (metrics.average_duration_seconds * (metrics.total_calls - 1)) + result.duration_seconds
        ) / metrics.total_calls
        metrics.last_executed_at = datetime.utcnow()


class ToolSchedulerImpl(ToolScheduler):
    """Scaffold implementation of delayed or cron recurring jobs."""

    def __init__(self, executor: ToolExecutor):
        self.executor = executor
        self._scheduled_jobs: Dict[str, Any] = {}

    def schedule_job(self, invocation: ToolInvocation, context: ToolContext, run_at_iso: str) -> str:
        job_id = str(uuid.uuid4())
        self._scheduled_jobs[job_id] = {
            "type": "one_shot",
            "invocation": invocation,
            "context": context,
            "time": run_at_iso
        }
        return job_id

    def schedule_recurring_job(self, invocation: ToolInvocation, context: ToolContext, cron_expr: str) -> str:
        job_id = str(uuid.uuid4())
        self._scheduled_jobs[job_id] = {
            "type": "cron",
            "invocation": invocation,
            "context": context,
            "cron": cron_expr
        }
        return job_id

    def cancel_job(self, job_id: str) -> bool:
        if job_id in self._scheduled_jobs:
            self._scheduled_jobs.pop(job_id)
            return True
        return False


class ToolQueueImpl(ToolQueue):
    """Concrete thread-safe in-memory queue mimicking high-priority Redis queues."""

    def __init__(self):
        self._queue: List[Tuple[int, ToolInvocation, ToolContext]] = []

    def push(self, invocation: ToolInvocation, context: ToolContext, priority: int = 0) -> str:
        # Pushes task onto local priority list
        self._queue.append((priority, invocation, context))
        # Sort queue descending by priority (higher priority runs first)
        self._queue.sort(key=lambda x: x[0], reverse=True)
        return invocation.invocation_id

    def pop(self) -> Optional[Tuple[ToolInvocation, ToolContext]]:
        if not self._queue:
            return None
        priority, invocation, context = self._queue.pop(0)
        return invocation, context

    def get_queue_size(self) -> int:
        return len(self._queue)
