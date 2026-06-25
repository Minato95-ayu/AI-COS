from typing import Dict, Any, List
from modules.tool_execution_engine.base import BaseTool
from modules.tool_execution_engine.models import ToolInvocation, ToolResult, ToolContext
from modules.tool_execution_engine.enums import ToolPermissionLevel

class TerminalToolAdapter(BaseTool):
    """Secure sandbox terminal access tool executing shell scripts or command-line processes."""
    
    def __init__(self):
        super().__init__(
            name="terminal_tool",
            description="Executes a safe shell command inside the active sandbox environment.",
            argument_schema={
                "command": {"type": "string", "required": True, "description": "The shell command to execute"},
                "cwd": {"type": "string", "required": False, "description": "Working directory path inside the sandbox"},
                "env": {"type": "object", "required": False, "description": "Environment variable overrides"}
            },
            required_permissions=[ToolPermissionLevel.EXECUTE],
            max_timeout_sec=60.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        from modules.tool_execution_engine.services import ToolSandboxImpl
        import os

        command = invocation.arguments.get("command")
        cwd_arg = invocation.arguments.get("cwd")
        env_arg = invocation.arguments.get("env") or {}

        # Determine the physical working directory, supporting the sandbox hierarchy
        cwd = context.workspace_path or "/tmp/ai_cos_host_workspace"
        if cwd_arg:
            if os.path.isabs(cwd_arg):
                cwd = cwd_arg
            else:
                cwd = os.path.abspath(os.path.join(cwd, cwd_arg))

        # Merge environment variables: system defaults -> context overrides -> invocation args overrides
        merged_env = os.environ.copy()
        if context.env_overrides:
            merged_env.update(context.env_overrides)
        if env_arg:
            merged_env.update({k: str(v) for k, v in env_arg.items()})

        # Set up sandbox manager
        sandbox = ToolSandboxImpl()

        # Run command asynchronously inside the sandbox environment
        result = await sandbox.run_command(
            command=[command],
            env=merged_env,
            timeout_sec=self.max_timeout_sec,
            cwd=cwd
        )

        result.invocation_id = invocation.invocation_id
        return result


class FileSystemToolAdapter(BaseTool):
    """Guarded filesystem proxy tool allowing workspace read, write, and deletion operations."""
    
    def __init__(self):
        super().__init__(
            name="filesystem_tool",
            description="Performs read, write, update, delete or traversal operations on workspace files.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "File action: read | write | delete | list_dir | mkdir"},
                "path": {"type": "string", "required": True, "description": "Relative file or directory path in workspace"},
                "content": {"type": "string", "required": False, "description": "Text content to write or append"}
            },
            required_permissions=[ToolPermissionLevel.READ, ToolPermissionLevel.WRITE],
            max_timeout_sec=15.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class GitToolAdapter(BaseTool):
    """Local repository version control manager executing checkout, branch, push and status cycles."""
    
    def __init__(self):
        super().__init__(
            name="git_tool",
            description="Manages local Git actions including cloning, branching, committing, and status.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "Git verb: clone | status | checkout | commit | branch"},
                "repo_path": {"type": "string", "required": True, "description": "Path to the repository folder"},
                "commit_message": {"type": "string", "required": False, "description": "Message for commit actions"},
                "branch_name": {"type": "string", "required": False, "description": "Target branch name"}
            },
            required_permissions=[ToolPermissionLevel.WRITE],
            max_timeout_sec=45.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class GitHubToolAdapter(BaseTool):
    """Cloud repository collaboration provider wrapper wrapping issue creation, PR management, and merges."""
    
    def __init__(self):
        super().__init__(
            name="github_tool",
            description="Executes remote GitHub REST API actions to manage pull requests, issues, and releases.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "API action: list_prs | create_issue | merge_pr | get_repo"},
                "repo_name": {"type": "string", "required": True, "description": "Owner and repository (e.g. 'google/ai-studio')"},
                "issue_title": {"type": "string", "required": False, "description": "Title of the issue to create"},
                "issue_body": {"type": "string", "required": False, "description": "Detailed description for issues/PRs"},
                "pr_number": {"type": "integer", "required": False, "description": "Target Pull Request ID"}
            },
            required_permissions=[ToolPermissionLevel.WRITE],
            max_timeout_sec=30.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class BrowserToolAdapter(BaseTool):
    """Headless web controller proxy supporting crawling, screenshots, page loading, and selector actions."""
    
    def __init__(self):
        super().__init__(
            name="browser_tool",
            description="Controls a headless browser for rendering, crawling, clicking elements, and taking screenshots.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "Browser verb: navigate | click | type | screenshot"},
                "url": {"type": "string", "required": True, "description": "Target URL to browse"},
                "selector": {"type": "string", "required": False, "description": "CSS selector query for clicks or inputs"},
                "text": {"type": "string", "required": False, "description": "Text input value"}
            },
            required_permissions=[ToolPermissionLevel.EXECUTE],
            max_timeout_sec=90.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class VSCodeToolAdapter(BaseTool):
    """Local workspace editor extension system connector managing active windows and diagnostics."""
    
    def __init__(self):
        super().__init__(
            name="vscode_tool",
            description="Connects to a running VS Code workspace editor instance to manipulate tabs and diagnostics.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "Editor action: open_file | show_warning | get_active_editor"},
                "file_path": {"type": "string", "required": True, "description": "Target file to display in editor window"},
                "line_number": {"type": "integer", "required": False, "description": "Line to scroll editor focus to"}
            },
            required_permissions=[ToolPermissionLevel.READ],
            max_timeout_sec=10.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class DockerToolAdapter(BaseTool):
    """Micro-service orchestrator managing container lifecycle, networking, mounts, and images."""
    
    def __init__(self):
        super().__init__(
            name="docker_tool",
            description="Coordinates isolated Docker container instances, builds, and networks.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "Docker action: run_container | stop_container | list_containers"},
                "image_name": {"type": "string", "required": False, "description": "Docker registry image name (e.g. 'ubuntu:latest')"},
                "container_id": {"type": "string", "required": False, "description": "Active container hash reference"},
                "ports": {"type": "object", "required": False, "description": "Port mapping mapping config"}
            },
            required_permissions=[ToolPermissionLevel.ADMIN],
            max_timeout_sec=120.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class PythonToolAdapter(BaseTool):
    """Isolated Python interpreter runtime executing safe script blocks in isolation."""
    
    def __init__(self):
        super().__init__(
            name="python_tool",
            description="Evaluates custom Python scripts inside a local isolated VM environment.",
            argument_schema={
                "code": {"type": "string", "required": True, "description": "Fully raw python source script to execute"},
                "requirements": {"type": "array", "required": False, "description": "Required external pip library packages to install"}
            },
            required_permissions=[ToolPermissionLevel.EXECUTE],
            max_timeout_sec=40.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class DatabaseToolAdapter(BaseTool):
    """Relational SQL gateway managing transactions, analytics, and metadata reflects."""
    
    def __init__(self):
        super().__init__(
            name="database_tool",
            description="Executes secure query transactions or inspects database schema structures.",
            argument_schema={
                "connection_string": {"type": "string", "required": True, "description": "Database system connection string DSN"},
                "query": {"type": "string", "required": True, "description": "The direct SQL command to run"},
                "parameters": {"type": "object", "required": False, "description": "Parameterized variables dictionary mapping"}
            },
            required_permissions=[ToolPermissionLevel.WRITE],
            max_timeout_sec=20.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class HTTPToolAdapter(BaseTool):
    """General REST HTTP client proxy supporting GET/POST/PUT/DELETE commands with custom headers."""
    
    def __init__(self):
        super().__init__(
            name="http_tool",
            description="Executes outbound REST requests with strict domain constraints and logging.",
            argument_schema={
                "method": {"type": "string", "required": True, "description": "HTTP verb: GET | POST | PUT | DELETE"},
                "url": {"type": "string", "required": True, "description": "Full remote endpoint path URL"},
                "headers": {"type": "object", "required": False, "description": "API request headers"},
                "payload": {"type": "string", "required": False, "description": "Outgoing message string request body"}
            },
            required_permissions=[ToolPermissionLevel.READ],
            max_timeout_sec=30.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass


class MCPToolAdapter(BaseTool):
    """Model Context Protocol (MCP) tool-proxy connecting to standard MCP server sessions."""
    
    def __init__(self):
        super().__init__(
            name="mcp_tool",
            description="Connects to any running Model Context Protocol (MCP) server integration to invoke resources or tools.",
            argument_schema={
                "action": {"type": "string", "required": True, "description": "MCP verb: list_tools | list_resources | call_tool"},
                "mcp_server_url": {"type": "string", "required": True, "description": "WebSocket or SSE URL of the MCP server daemon"},
                "tool_name": {"type": "string", "required": False, "description": "Specific sub-tool registered in the server"},
                "tool_arguments": {"type": "object", "required": False, "description": "Arguments payload for the sub-tool"}
            },
            required_permissions=[ToolPermissionLevel.EXECUTE],
            max_timeout_sec=45.0
        )

    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        # Architecture only - Do not implement logic
        pass
