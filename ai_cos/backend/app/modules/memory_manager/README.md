# Memory Manager Module

The `Memory Manager` implements a decoupled multi-tier episodic memory engine. It abstracts short-term context windows, long-term state files, and semantic vector indexing databases (such as Qdrant or PGVector).

## Folder Structure
- `interfaces.py`: Defines the semantic and episodic read/write contracts.
- `base.py`: Handles chronological memory decay formulas.
- `models.py`: Pydantic classes mapping memory vectors, context layers.
- `services.py`: Multi-tier context assembly engines.
- `repository.py`: Decoupled vector and state persistence repository.
