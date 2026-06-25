import time
from typing import List, Dict, Any, Optional
from datetime import datetime
from agent_framework.base import BaseAgent
from agent_framework.models import AgentProfile, AgentPermissions, AgentTask, AgentResult, AgentEvent, AgentContext
from agent_framework.enums import AgentRole, AgentState, ExecutionMode, ReasoningMode
from agent_framework.interfaces import AgentMemory, AgentCommunication
from model_adapter.interfaces import ProviderAdapter
from model_adapter.models import ChatRequest, ChatMessage

class SimpleAgentMemory(AgentMemory):
    """Simple in-memory cache implementation of AgentMemory."""
    
    def __init__(self):
        self._memories: Dict[str, Any] = {}
        self._history: List[Dict[str, Any]] = []

    async def recall(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        # Simple recall returning any matching keys or last items
        results = []
        for h in self._history[-limit:]:
            if query.lower() in str(h).lower():
                results.append(h)
        return results

    async def store(self, key: str, val: Any, metadata: Optional[Dict[str, Any]] = None) -> None:
        self._memories[key] = val
        self._history.append({"key": key, "value": val, "metadata": metadata or {}, "timestamp": time.time()})

    async def clear_short_term(self) -> None:
        self._history.clear()


class SimpleAgentCommunication(AgentCommunication):
    """Simple concrete implementation of AgentCommunication."""
    
    def __init__(self):
        self._subscribers: Dict[str, List[Any]] = {}

    async def send_direct_message(self, recipient_agent_id: str, message: Dict[str, Any]) -> bool:
        print(f"[P2P Comm] Sending message to {recipient_agent_id}: {message}")
        return True

    async def broadcast_event(self, event: AgentEvent) -> None:
        print(f"[Event Broadcast] Broadcaster: {event.source_agent_id} | Type: {event.event_type}")
        callbacks = self._subscribers.get(event.event_type, [])
        for cb in callbacks:
            try:
                await cb(event)
            except Exception as e:
                print(f"Error handling broadcast: {e}")

    async def subscribe_to_event(self, event_type: str, callback: Any) -> None:
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)


class GeneralEngineerAgent(BaseAgent):
    """
    Concrete implementation of an AI employee General Engineer.
    Handles general coding, script writing, and architectural generation tasks.
    """

    def __init__(
        self,
        profile: AgentProfile,
        permissions: AgentPermissions,
        memory: AgentMemory,
        communication: AgentCommunication,
        model_adapter: ProviderAdapter,
        tool_registry: Optional[Any] = None,
        tool_executor: Optional[Any] = None
    ):
        super().__init__(profile, permissions, memory, communication)
        self.model_adapter = model_adapter
        self.tool_registry = tool_registry
        self.tool_executor = tool_executor
        self.update_health_status(AgentState.IDLE)

    async def on_initialize(self) -> None:
        self.update_health_status(AgentState.INITIALIZING)
        self.log_activity("Initializing GeneralEngineerAgent workspace resources...")
        self.update_health_status(AgentState.IDLE)

    async def on_task_start(self, task: AgentTask) -> None:
        self.update_health_status(AgentState.PLANNING)
        self.log_activity(f"Starting task execution: {task.task_id} - Description: {task.description[:60]}")
        self.metrics.total_tasks_received += 1
        self.metrics.last_active_at = datetime.utcnow()

    async def on_task_complete(self, result: AgentResult) -> None:
        self.update_health_status(AgentState.IDLE)
        self.log_activity(f"Completed task execution: {result.task_id} - Success: {result.success}")
        if result.success:
            self.metrics.total_tasks_completed += 1
        else:
            self.metrics.total_tasks_failed += 1
            
        self.metrics.total_token_spend += result.token_usage.get("total_tokens", 0)
        self.metrics.total_cost_usd += result.token_usage.get("estimated_cost_usd", 0.0)

    async def on_terminate(self) -> None:
        self.update_health_status(AgentState.TERMINATED)
        self.log_activity("GeneralEngineerAgent standing down from active pool.")

    async def execute_task(self, task: AgentTask) -> AgentResult:
        await self.on_task_start(task)
        
        self.update_health_status(AgentState.EXECUTING)
        start_time = time.time()
        
        command_to_run = None
        output_content = ""
        success = True
        error_message = None
        token_usage_dict = {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0, "estimated_cost_usd": 0.0}

        # Check for direct terminal prefix request like "run: ls"
        if task.description.strip().startswith("run:") or task.description.strip().startswith("execute:"):
            parts = task.description.strip().split(":", 1)
            command_to_run = parts[1].strip()
            output_content = f"Direct Command Detected: {command_to_run}\n"
        
        # If no direct command, query the model to see if it wants to generate and run code
        if not command_to_run and self.model_adapter:
            system_prompt = (
                "You are the GeneralEngineerAgent, a highly capable software engineer AI employee. "
                "Your department is Engineering. Your role is General Engineer. "
                "You have access to a real Terminal Tool. "
                "If the task requires creating files, installing packages, or running commands, "
                "you MUST output a shell command to perform those actions. "
                "To run a command, include a line in your response starting exactly with 'EXECUTE_TERMINAL_COMMAND: ' followed by the command. "
                "Example:\n"
                "EXECUTE_TERMINAL_COMMAND: cat << 'EOF' > test.py\n"
                "print('Hello World')\n"
                "EOF\n"
                "python3 test.py\n\n"
                "If no terminal execution is needed, just output the code solution directly."
            )
            
            messages = [
                ChatMessage(role="system", content=system_prompt),
                ChatMessage(role="user", content=f"Task: {task.description}\nExpected Output Format: {task.expected_output_format}")
            ]
            
            chat_request = ChatRequest(
                request_id=f"req-{task.task_id}",
                model_id=self.profile.preferred_models[0] if self.profile.preferred_models else "ollama-model",
                messages=messages,
                temperature=0.2
            )
            
            try:
                chat_response = await self.model_adapter.chat(chat_request)
                output_content = chat_response.message.content
                token_usage_dict = {
                    "prompt_tokens": chat_response.usage.prompt_tokens,
                    "completion_tokens": chat_response.usage.completion_tokens,
                    "total_tokens": chat_response.usage.total_tokens,
                    "estimated_cost_usd": chat_response.usage.estimated_cost_usd
                }
                
                # Check if the model wants to execute a command
                if "EXECUTE_TERMINAL_COMMAND:" in output_content:
                    parts = output_content.split("EXECUTE_TERMINAL_COMMAND:", 1)
                    command_to_run = parts[1].strip()
                    # Clean up markdown block wrapping if LLM did it
                    if command_to_run.startswith("```"):
                        lines = command_to_run.splitlines()
                        if lines[0].strip().startswith("```"):
                            lines = lines[1:]
                        if lines[-1].strip() == "```":
                            lines = lines[:-1]
                        command_to_run = "\n".join(lines).strip()
            except Exception as e:
                self.log_activity(f"LLM Chat Error: {str(e)}")
                output_content = f"Error during model chat: {str(e)}"
                success = False
                error_message = str(e)
                self.health.error_count += 1
                self.health.last_error_message = error_message
                self.update_health_status(AgentState.ERROR)

        # If a command is identified (either direct or generated), run it
        if command_to_run and self.tool_executor:
            self.log_activity(f"Tool Execution Requested: '{command_to_run[:60]}...'")
            
            from modules.tool_execution_engine.models import ToolInvocation, ToolContext, ToolPermission
            from modules.tool_execution_engine.enums import SandboxMode, ToolPermissionLevel
            import uuid
            import os
            
            invocation = ToolInvocation(
                invocation_id=f"inv-{uuid.uuid4().hex[:8]}",
                tool_name="terminal_tool",
                arguments={
                    "command": command_to_run
                },
                invoker_id=self.profile.agent_id,
                trace_id=f"trc-{uuid.uuid4().hex[:8]}"
            )
            
            permission = ToolPermission(
                permission_id=f"perm-{uuid.uuid4().hex[:8]}",
                principal_id=self.profile.agent_id,
                tool_name="terminal_tool",
                level=ToolPermissionLevel.EXECUTE
            )
            
            # Workspace setup
            workspace = os.path.join(os.getcwd(), "ai_cos/backend/app/workspace")
            os.makedirs(workspace, exist_ok=True)

            context = ToolContext(
                trace_id=invocation.trace_id,
                session_id=f"sess-{uuid.uuid4().hex[:8]}",
                sandbox_mode=SandboxMode.NONE,
                permissions=[permission],
                workspace_path=workspace
            )
            
            self.log_activity("Invoking Terminal Tool via ToolExecutor...")
            
            try:
                tool_result = await self.tool_executor.execute(invocation, context)
                self.log_activity(f"Terminal Tool Result Status: {tool_result.status.value}")
                
                execution_info = (
                    f"\n\n--- TERMINAL COMMAND EXECUTION ---\n"
                    f"Command: {command_to_run}\n"
                    f"Exit Code: {tool_result.exit_code}\n"
                    f"Status: {tool_result.status.value}\n"
                    f"Stdout:\n{tool_result.stdout}\n"
                    f"Stderr:\n{tool_result.stderr}\n"
                    f"-----------------------------------\n"
                )
                output_content += execution_info
                success = (tool_result.exit_code == 0)
                if not success:
                    error_message = tool_result.error_message or f"Terminal command failed with exit code {tool_result.exit_code}"
            except Exception as e:
                self.log_activity(f"Terminal Execution Exception: {str(e)}")
                output_content += f"\n\nFailed to run command: {str(e)}"
                success = False
                error_message = str(e)
                self.health.error_count += 1
                self.health.last_error_message = error_message
                self.update_health_status(AgentState.ERROR)

        # Store in episodic memory
        try:
            await self.memory.store(task.task_id, output_content, {"description": task.description})
        except Exception as e:
            self.log_activity(f"Failed to save task to memory: {e}")

        duration = time.time() - start_time
        
        result = AgentResult(
            task_id=task.task_id,
            success=success,
            output_data={"result": output_content},
            error_message=error_message,
            token_usage=token_usage_dict,
            duration_seconds=duration
        )
        
        await self.on_task_complete(result)
        
        # Broadcast completed event
        event = AgentEvent(
            event_id=f"evt-{task.task_id}",
            source_agent_id=self.profile.agent_id,
            event_type="task_completed" if success else "task_failed",
            payload={"task_id": task.task_id, "success": success}
        )
        await self.communication.broadcast_event(event)
        
        return result
