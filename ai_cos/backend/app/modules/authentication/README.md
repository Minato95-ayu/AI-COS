# Authentication Module

The `Authentication` module secures operational access. It verifies developer, admin, and agent tokens to ensure callers match target clearances.

## Folder Structure
- `interfaces.py`: Defines login, token verification, and session identity lookup.
- `base.py`: Performs hashing logic.
- `models.py`: Maps Pydantic claims structures.
- `services.py`: Validates payloads and produces active tokens.
- `repository.py`: Directly queries identity stores.
