from typing import Dict, Optional
from .models import ExecutionPlan

class TaskPlannerRepository:
    """Decoupled persistence tier to track generated plans and structural DAG runs."""
    
    def __init__(self):
        self._store: Dict[str, ExecutionPlan] = {}

    async def save_plan(self, plan: ExecutionPlan) -> None:
        self._store[plan.plan_id] = plan

    async def get_plan(self, plan_id: str) -> Optional[ExecutionPlan]:
        return self._store.get(plan_id)
