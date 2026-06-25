from abc import ABC, abstractmethod
from typing import List
from .models import PluginManifest

class IPluginSystem(ABC):
    """Abstract system enabling third-party developers to hot-load custom OS components."""
    
    @abstractmethod
    async def load_plugin(self, manifest_path: str) -> PluginManifest:
        """Verify metadata structures and hook the plugin module dynamically."""
        pass

    @abstractmethod
    async def unload_plugin(self, plugin_id: str) -> bool:
        """Gracefully detach a plugin session and clear loaded hooks."""
        pass

    @abstractmethod
    async def get_active_plugins(self) -> List[PluginManifest]:
        """Retrieve active modules."""
        pass
