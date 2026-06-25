from typing import List
from .models import RouteDefinition

class APIRepository:
    """Datastore tracking running route metadata, active rate limit pools, and access keys."""
    
    def __init__(self):
        self._active_routes: List[RouteDefinition] = []

    async def log_mounted_route(self, route: RouteDefinition) -> None:
        self._active_routes.append(route)
