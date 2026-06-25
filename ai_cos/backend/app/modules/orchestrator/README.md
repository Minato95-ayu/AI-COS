# Orchestrator Module

The `Orchestrator` governs the global coordination flow across specialized AI workers. It manages DAG task dependencies, monitors active execution steps, and routes states.

## Folder Structure
- `interfaces.py`: Defines `IOrchestrator` contract.
- `base.py`: Implements common logs and ABC properties.
- `models.py`: Pydantic schemas for `WorkflowExecution` and `WorkflowStep`.
- `services.py`: Concrete `OrchestratorService` implementing the dispatch engine.
- `repository.py`: In-memory and persistence stores for execution tracing.
- `config.py`: Module configurations.
