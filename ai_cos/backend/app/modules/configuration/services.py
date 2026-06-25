from typing import Dict, Any
from .base import BaseConfiguration
from .models import SystemSettings, ModuleSettings

class ConfigurationService(BaseConfiguration):
    """Concrete configuration delivery service matching environment overrides."""
    
    async def get_system_settings(self) -> SystemSettings:
        # Build composite configurations with overrides
        stored_overrides = await self.repository.get_overrides()
        return SystemSettings(
            environment_name=self.config.environment,
            debug_mode_enabled=self.config.debug_mode,
            system_wide_overrides=stored_overrides
        )

    async def update_module_override(self, module_id: str, updates: Dict[str, Any]) -> ModuleSettings:
        override = ModuleSettings(module_id=module_id, overrides=updates)
        await self.repository.save_override(override)
        return override
