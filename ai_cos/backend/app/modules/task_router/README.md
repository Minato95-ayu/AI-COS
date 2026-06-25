# Task Router Module

The `Task Router` performs semantic match evaluations. Given a specific PlanStep requiring specific expertise, it queries the Agent Registry and evaluates performance metrics to bind the task to an optimal agent.

## Folder Structure
- `interfaces.py`: Defines the capabilities router API.
- `base.py`: Performs matching logic calculus.
- `models.py`: Data classes for `RoutePayload` and assignments decision bounds.
- `services.py`: Standardizes routing and backup procedures.
- `repository.py`: Decoupled telemetry trace repository for routing.
