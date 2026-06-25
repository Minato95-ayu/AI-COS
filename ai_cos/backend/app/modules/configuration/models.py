from pydantic import BaseModel, Field
from typing import Dict, Any

class ModuleSettings(BaseModel):
    module_id: str
    overrides: Dict[str, Any] = Field(default_factory=dict)

class SystemSettings(BaseModel):
    environment_name: str = "production"
    core_version: str = "1.0.0"
    debug_mode_enabled: bool = False
    system_wide_overrides: Dict[str, ModuleSettings] = Field(default_factory=dict)
