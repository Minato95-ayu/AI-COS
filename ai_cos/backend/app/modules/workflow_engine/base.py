from abc import ABC
from typing import List, Dict, Set
from .interfaces import WorkflowExecutor
from .models import WorkflowDefinition, TaskDependency, WorkflowStep

class BaseWorkflowExecutor(WorkflowExecutor, ABC):
    """
    Abstract Base Class for the Execution loop, wrapping thread queues, events tracking, 
    and error translations.
    """

    def __init__(self, executor_id: str):
        self.executor_id = executor_id

    def log_execution_event(self, workflow_id: str, event_text: str) -> None:
        """Telemetry callback trace."""
        print(f"[WorkflowExecutor {self.executor_id}] Workflow: {workflow_id} -> {event_text}")


class DependencyGraph:
    """
    Helper module modeling the active Directed Acyclic Graph (DAG) for a workflow.
    Validates cyclic dependency boundaries, returns root stages, and resolves ready nodes.
    """

    def __init__(self, definition: WorkflowDefinition):
        self.definition = definition
        self.adjacency_list: Dict[str, Set[str]] = {step.step_id: set() for step in definition.steps}
        self.in_degree: Dict[str, int] = {step.step_id: 0 for step in definition.steps}
        self._build_graph()

    def _build_graph(self) -> None:
        for dep in self.definition.dependencies:
            if dep.parent_step_id in self.adjacency_list and dep.child_step_id in self.adjacency_list:
                self.adjacency_list[dep.parent_step_id].add(dep.child_step_id)
                self.in_degree[dep.child_step_id] += 1

    def is_acyclic(self) -> bool:
        """Kahn's algorithm checks for cyclic dependency blocks."""
        in_deg = self.in_degree.copy()
        queue = [node for node, deg in in_deg.items() if deg == 0]
        visited_count = 0

        while queue:
            node = queue.pop(0)
            visited_count += 1
            for neighbor in self.adjacency_list[node]:
                in_deg[neighbor] -= 1
                if in_deg[neighbor] == 0:
                    queue.append(neighbor)

        return visited_count == len(self.definition.steps)

    def get_ready_steps(self, completed_step_ids: Set[str]) -> List[str]:
        """Find nodes where all dependencies are completed."""
        ready = []
        for step in self.definition.steps:
            if step.step_id in completed_step_ids:
                continue
            
            # Find dependencies leading to this child
            dependencies = [dep.parent_step_id for dep in self.definition.dependencies if dep.child_step_id == step.step_id]
            if all(dep in completed_step_ids for dep in dependencies):
                ready.append(step.step_id)
        return ready
