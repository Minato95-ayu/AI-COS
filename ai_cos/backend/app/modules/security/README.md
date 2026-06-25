# Security Module

The `Security` module acts as a defensive proxy. It intercept prompts to block injection attempts and scans outgoing responses to filter private database schemas or confidential company credentials.

## Folder Structure
- `interfaces.py`: Defines prompt scans and safety rule injection APIs.
- `base.py`: Performs regex and standard credentials checks.
- `models.py`: Maps violation telemetry.
- `services.py`: Concrete proxy filter checking safety status.
- `repository.py`: Maps dynamic policies databases.
