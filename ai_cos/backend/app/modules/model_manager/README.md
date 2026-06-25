# Model Manager Module

The `Model Manager` isolates model execution. It handles dynamic local model swaps (using Ollama), balances VRAM consumption pools, and wraps external model calls under an identical non-blocking contract.

## Folder Structure
- `interfaces.py`: Defines uniform `load` and `generate` methods.
- `base.py`: Inspects GPU temperatures and coordinates fallback procedures.
- `models.py`: Dictates capability footprints.
- `services.py`: Manages Ollama API boundaries and external client mappings.
- `repository.py`: Maps active, mounted VRAM allocations.
