# Agent Registry Module

The `Agent Registry` acts as the master catalog for hundreds of specialized AI agents. It maps agent requirements to system prompts, capabilities, and department hierarchies.

## Folder Structure
- `interfaces.py`: Defines `IAgentRegistry` CRUD and search contracts.
- `base.py`: Provides validation stubs and base definitions.
- `models.py`: Pydantic schemas for `AgentProfile` and capability weights.
- `services.py`: Implements discovery, status monitoring, and lifecycle hooks.
- `repository.py`: Decoupled persistence interface for registry storage.
