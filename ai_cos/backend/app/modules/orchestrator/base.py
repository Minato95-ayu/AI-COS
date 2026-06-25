from abc import ABC
from .interfaces import IOrchestrator
from .config import OrchestratorConfig
from .repository import OrchestratorRepository

class BaseOrchestrator(IOrchestrator, ABC):
    """Abstract base class for the Orchestrator with shared configuration and telemetry tools."""
    
    def __init__(self, config: OrchestratorConfig, repository: OrchestratorRepository):
        self.config = config
        self.repository = repository

    def log_workflow_state(self, workflow_id: str, status: str) -> None:
        """Standard logger callback for active workflow traces."""
        print(f"[Orchestrator Core] Workflow '{workflow_id}' updated to: {status}")
