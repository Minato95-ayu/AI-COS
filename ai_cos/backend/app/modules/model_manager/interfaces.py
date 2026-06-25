from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator
from .models import ModelConfig, ModelMountRequest

class IModelManager(ABC):
    """Interface managing hardware execution, orchestration, and LLM queries."""
    
    @abstractmethod
    async def load_and_mount_model(self, request: ModelMountRequest) -> bool:
        """Command the local engine (Ollama) to dynamically allocate VRAM for a model."""
        pass

    @abstractmethod
    async def generate_response(self, model: str, prompt: str, params: Dict[str, Any]) -> str:
        """Standard non-blocking response generation."""
        pass

    @abstractmethod
    async def stream_response(self, model: str, prompt: str, params: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """Streaming text generation from the requested model."""
        pass
