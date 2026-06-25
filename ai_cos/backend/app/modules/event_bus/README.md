# Event Bus Module

The `Event Bus` decouples communications. It acts as an operational pub/sub exchange, conveying transaction alerts, model completion states, and direct inter-agent prompts.

## Folder Structure
- `interfaces.py`: Defines standard async publish and subscribe.
- `base.py`: Performs names validations.
- `models.py`: Maps standard `SystemEvent` models.
- `services.py`: Implements memory queues and routing handlers.
- `repository.py`: Keeps local event history traces.
