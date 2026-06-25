from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from .models import SystemSettings, ModuleSettings

class IConfiguration(ABC):
    """Dynamic runtime configuration manager mapping system settings overrides."""
    
    @abstractmethod
    async def get_system_settings(self) -> SystemSettings:
        """Retrieve global operating system config params."""
        pass

    @abstractmethod
    async def update_module_override(self, module_id: str, updates: Dict[str, Any]) -> ModuleSettings:
        """Set an active dynamic runtime parameter."""
        pass
