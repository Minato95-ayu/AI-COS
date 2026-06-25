from typing import Dict, List, Type, Optional
from .models import ModelProfile
from .interfaces import ProviderAdapter

class ModelRegistry:
    """
    Thread-safe repository holding active model profiles loaded across local nodes and cloud gateways.
    """

    def __init__(self):
        self._profiles: Dict[str, ModelProfile] = {}

    def register_model_profile(self, profile: ModelProfile) -> None:
        """Register a model's profile config with capabilities and cost matrices."""
        self._profiles[profile.model_id] = profile

    def get_profile(self, model_id: str) -> Optional[ModelProfile]:
        """Fetch a registered model's profile details."""
        return self._profiles.get(model_id)

    def list_all_models(self) -> List[ModelProfile]:
        """List all registered models across Ollama, OpenAI, Gemini, etc."""
        return list(self._profiles.values())


class ProviderRegistry:
    """
    Central catalog of implemented Adapter subclasses.
    Allows easy hot-swapping or registering new provider modules.
    """

    def __init__(self):
        self._adapters: Dict[str, Type[ProviderAdapter]] = {}

    def register_provider_adapter(self, provider_name: str, adapter_cls: Type[ProviderAdapter]) -> None:
        """Map a provider label (e.g., 'ollama') to its specific concrete adapter implementation class."""
        self._adapters[provider_name.lower()] = adapter_cls

    def get_adapter_class(self, provider_name: str) -> Optional[Type[ProviderAdapter]]:
        """Retrieve an adapter class mapping for instantiation."""
        return self._adapters.get(provider_name.lower())
