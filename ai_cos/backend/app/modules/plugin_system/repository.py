from typing import Dict, List
from .models import PluginManifest, PluginStatus

class PluginRepository:
    """Decoupled database repository storing metadata of dynamic plugins."""
    
    def __init__(self):
        self._store: Dict[str, PluginManifest] = {}

    async def store_plugin(self, manifest: PluginManifest) -> None:
        self._store[manifest.plugin_id] = manifest

    async def update_status(self, plugin_id: str, status: PluginStatus) -> bool:
        if plugin_id in self._store:
            self._store[plugin_id].status = status
            return True
        return False

    async def get_all_active(self) -> List[PluginManifest]:
        return [p for p in self._store.values() if p.status == PluginStatus.LOADED]
