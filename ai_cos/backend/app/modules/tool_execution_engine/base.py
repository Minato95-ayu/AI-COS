from abc import ABC, abstractmethod
from typing import Dict, Any, List
from modules.tool_execution_engine.models import ToolInvocation, ToolResult, ToolContext
from modules.tool_execution_engine.enums import ToolPermissionLevel

class BaseTool(ABC):
    """
    Standardized Abstract Base Class for all AI Company OS tools.
    Every single tool adapter must extend this class to ensure absolute interface parity.
    """

    def __init__(
        self,
        name: str,
        description: str,
        argument_schema: Dict[str, Any],
        required_permissions: List[ToolPermissionLevel],
        max_timeout_sec: float = 30.0,
        max_retries: int = 3
    ):
        self.name = name
        self.description = description
        self.argument_schema = argument_schema
        self.required_permissions = required_permissions
        self.max_timeout_sec = max_timeout_sec
        self.max_retries = max_retries

    def validate_arguments(self, arguments: Dict[str, Any]) -> bool:
        """
        Validate incoming parameters against the tool's defined argument_schema.
        Can be overridden for complex, nested validation logic.
        """
        for param, spec in self.argument_schema.items():
            is_required = spec.get("required", False)
            param_type = spec.get("type", None)

            if param not in arguments:
                if is_required:
                    raise ValueError(f"Required parameter '{param}' is missing from tool arguments.")
                continue

            val = arguments[param]
            # Basic validation of expected types
            if param_type == "string" and not isinstance(val, str):
                raise TypeError(f"Parameter '{param}' must be a string, got {type(val).__name__}")
            elif param_type == "integer" and not isinstance(val, int):
                raise TypeError(f"Parameter '{param}' must be an integer, got {type(val).__name__}")
            elif param_type == "boolean" and not isinstance(val, bool):
                raise TypeError(f"Parameter '{param}' must be a boolean, got {type(val).__name__}")
            elif param_type == "array" and not isinstance(val, list):
                raise TypeError(f"Parameter '{param}' must be an array (list), got {type(val).__name__}")
            elif param_type == "object" and not isinstance(val, dict):
                raise TypeError(f"Parameter '{param}' must be an object (dict), got {type(val).__name__}")

        return True

    @abstractmethod
    async def _execute_internal(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        """
        Core implementation logic for the tool. 
        Must be implemented by concrete adapters.
        """
        pass

    async def pre_execute(self, invocation: ToolInvocation, context: ToolContext) -> None:
        """
        Hook executed before '_execute_internal'. 
        Ideal for custom permission audits, parameter mapping, or file system pre-allocations.
        """
        self.validate_arguments(invocation.arguments)

    async def post_execute(self, invocation: ToolInvocation, context: ToolContext, result: ToolResult) -> None:
        """
        Hook executed after '_execute_internal'.
        Ideal for cleaning up transient variables, writing audit logs, or tracking metrics.
        """
        pass

    async def run(self, invocation: ToolInvocation, context: ToolContext) -> ToolResult:
        """
        Guarded entry point called by the ToolExecutor service.
        Ensures execution is surrounded by validation, hooks, and clean handling.
        """
        await self.pre_execute(invocation, context)
        try:
            result = await self._execute_internal(invocation, context)
        except Exception as e:
            # Fallback error mapping for safety
            result = ToolResult(
                invocation_id=invocation.invocation_id,
                status="FAILED",
                error_message=str(e),
                exit_code=1
            )
        await self.post_execute(invocation, context, result)
        return result
