# Tool Manager Module

The `Tool Manager` provides an decoupled tool repository. It stores structural tool inputs/outputs, maps system schemas to LLM format params, and applies access control boundaries.

## Folder Structure
- `interfaces.py`: Defines register and run contracts.
- `base.py`: Implements permissions and sanitizations.
- `models.py`: Maps parameter and validation definitions.
- `services.py`: Validates schema structure and executes calls.
- `repository.py`: Holds active tool definitions database mapping.
