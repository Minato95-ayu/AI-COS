from typing import Dict
from .models import ModuleSettings

class ConfigurationRepository:
    """Data store keeping track of dynamic database overrides for settings."""
    
    def __init__(self):
        self._overrides: Dict[str, ModuleSettings] = {}

    async def save_override(self, override: ModuleSettings) -> None:
        self._overrides[override.module_id] = override

    async def get_overrides(self) -> Dict[str, ModuleSettings]:
        return self._overrides
