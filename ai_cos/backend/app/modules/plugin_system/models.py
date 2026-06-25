from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class PluginStatus(str, Enum):
    LOADED = "loaded"
    UNLOADED = "unloaded"
    BLOCKED = "blocked"

class PluginMetadata(BaseModel):
    author: str
    website: str
    license_type: str

class PluginManifest(BaseModel):
    plugin_id: str
    name: str
    version: str
    entry_point_file: str
    metadata: PluginMetadata
    status: PluginStatus = PluginStatus.UNLOADED
