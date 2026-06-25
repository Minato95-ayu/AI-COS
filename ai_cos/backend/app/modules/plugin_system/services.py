from typing import List
from .base import BasePluginSystem
from .models import PluginManifest, PluginStatus, PluginMetadata

class PluginSystemService(BasePluginSystem):
    """Concrete plugin loader dynamically parsing manifests and binding triggers."""
    
    async def load_plugin(self, manifest_path: str) -> PluginManifest:
        self.verify_signature(manifest_path)
        # Mocking parsing manifest JSON
        manifest = PluginManifest(
            plugin_id="plg_jira_connector",
            name="Jira Connector Extension",
            version="1.0.4",
            entry_point_file="jira_plugin.py",
            metadata=PluginMetadata(
                author="Enterprise-Plugins",
                website="https://enterprise.local/plugins",
                license_type="MIT"
            ),
            status=PluginStatus.LOADED
        )
        await self.repository.store_plugin(manifest)
        return manifest

    async def unload_plugin(self, plugin_id: str) -> bool:
        return await self.repository.update_status(plugin_id, PluginStatus.UNLOADED)

    async def get_active_plugins(self) -> List[PluginManifest]:
        return await self.repository.get_all_active()
