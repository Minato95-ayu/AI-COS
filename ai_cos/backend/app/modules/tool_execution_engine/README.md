# AI Company Operating System (AI-COS) - Tool Execution Engine

The `tool_execution_engine` is a highly secure, enterprise-grade runtime module designed to safely execute real-world operations in the host system, external APIs, and local development tools on behalf of AI workers.

To prevent prompt injection vulnerability risks and malicious command execution, every operation is guarded by strict permission envelopes, network policies, timeout decorators, retry handlers, and isolated execution sandboxes.

---

## Architecture Blueprint

```
                     +---------------------------+
                     |    Orchestration Agent    |
                     +-------------+-------------+
                                   |
                                   | (Dispatches ToolInvocation & Context)
                                   v
                     +---------------------------+
                     |        ToolExecutor       | <---+ ToolPolicy Engine
                     +-------------+-------------+ <---+ ToolPermission Check
                                   |
                                   | (1. Enforces permissions & policies)
                                   | (2. Hooks into ToolSandbox environment)
                                   v
                    +--------------+--------------+
                    |        ToolSandbox          |
                    |   (Docker / gVisor Mount)   |
                    +--------------+--------------+
                                   |
                                   v
                    +--------------+--------------+
                    |           BaseTool          | (Unified Interface API)
                    |     (Concrete Adapters)     |
                    +--------------+--------------+
                                   |
               +-------------------+-------------------+
               |                                       |
               v                                       v
    +----------------------+               +----------------------+
    |  TerminalAdapter     |               |    FileSystemAdapter |
    +----------------------+               +----------------------+
    |  GitToolAdapter      |               |    GitHubToolAdapter |
    +----------------------+               +----------------------+
    |  BrowserToolAdapter  |               |    VSCodeToolAdapter |
    +----------------------+               +----------------------+
    |  DockerToolAdapter   |               |    PythonToolAdapter |
    +----------------------+               +----------------------+
    |  DatabaseToolAdapter |               |    HTTPToolAdapter   |
    +----------------------+               +----------------------+
    |  MCPToolAdapter      |
    +----------------------+
```

---

## Core Specification Design

Every tool is built around an identical, immutable, type-safe interface governed by the `BaseTool` abstract base class. This ensures any AI engine can execute any tool without custom formatting tricks.

### 1. Architectural Components

1. **`BaseTool`**: The core abstract class establishing schemas, required security clearance parameters, timeout parameters, and execute-lifecycle hooks (`pre_execute`, `_execute_internal`, `post_execute`).
2. **`ToolRegistry`**: High-performance dictionary-indexed registry that catalogues and checks health metrics for all operational adapters.
3. **`ToolExecutor`**: The main execution orchestrator. Injects sandbox setups, coordinates async timeouts, manages retry budgets, monitors cancellation signals, and logs transactions.
4. **`ToolPermission`**: Scope-level configurations governing allowed parameters and explicitly blocklisted parameters.
5. **`ToolPolicy`**: Enterprise boundaries governing which sandboxes can run which scripts, maximum RAM sizes, disk bandwidth limits, and domain name whitelists.
6. **`ToolInvocation`**: Formal input parameter payload carrying identifiers, arguments dictionaries, and trace headers.
7. **`ToolResult`**: Uniform output structure guaranteeing standardized error codes (`stdout`, `stderr`, `exit_code`, metrics, and timing specs).
8. **`ToolContext`**: Holds transactional metadata including current active policies, sandbox levels, permissions, and cancel signals.
9. **`ToolMetrics`**: Tracks usage patterns, average runtimes, error ratios, and peak memory limits.
10. **`ToolHealth`**: Performs diagnostic health validations on tool dependencies (e.g., verifying Docker daemon access, checking Python interpreter paths).
11. **`ToolSandbox`**: Handles filesystem isolation (direct host directory boundaries or hardened micro-containers).
12. **`ToolScheduler`**: Manages delayed jobs and repeating cron-like scheduler tasks.
13. **`ToolAudit`**: Immutable, chronological compliance log tracking cryptographic parameter hashes, executor ids, duration metrics, and security verdicts.
14. **`ToolQueue`**: Thread-safe priority task dispatcher queue routing heavy jobs to worker pools.

---

## Core Security Guardrails & execution constraints

Every single execution follows an identical pipeline:

### Timeout Enforcement
Every invocation wraps its internal execution loop inside a standard asynchronous timeout wrapper (`asyncio.wait_for()`) using the tool's `max_timeout_sec` configuration. If runtime exceeds this threshold, the task is immediately terminated, resources are torn down, and a `TIMEOUT` status is returned with exit code `124`.

### Dynamic Cancellation
The `ToolExecutor` supports live non-blocking cancellations. If a user or overseer cancels a thread, the executor detects the active cancellation token inside the loop, aborts before the next attempt, releases locks, and returns code `130`.

### Adaptive Retry with Exponential Backoff
When transient errors occur (network jitter or locked workspaces), the executor loops up to `max_retries` attempts, sleeping dynamically (`1.5 * attempts` seconds) between iterations to give infrastructure time to recover.

### Structural Permissions & Regex Enforcements
Prior to launching any task, the executor verifies the invoker's security clearance. It scans argument values against blocklisted characters/commands (e.g., matching `rm -rf` patterns or forbidden bash flags) and raises a security block immediately on mismatch.

### Workspace Sandboxing
Untrusted commands are isolated. The executor provisons a dedicated directory path or boots an ephemeral Docker micro-container, executes the action inside the container boundary, copy-resolves files, and wipes the container on completion.

### Immutable Audit Logs
Every single step is logged using cryptographic SHA-256 parameter hashes. Even if the tool fails, a security audit trace is appended chronologically to trace and secure the workspace against malicious actors.
