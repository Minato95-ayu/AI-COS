from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any
from .interfaces import ProviderAdapter
from .models import ChatRequest, ChatResponse, ModelProfile, StreamingResponse

class BaseModelAdapter(ProviderAdapter, ABC):
    """
    Abstract Base Class for model adapters.
    Provides shared configuration, logging hook, error translation, and formatting wrappers.
    """

    def __init__(self, profile: ModelProfile, custom_settings: Dict[str, Any] = None):
        self.profile = profile
        self.custom_settings = custom_settings or {}

    def log_inference_trace(self, request_id: str, prompt_tokens: int, completion_tokens: int) -> None:
        """Shared telemetry hook for logging token throughput."""
        print(f"[ModelAdapter Trace] request_id={request_id} "
              f"model={self.profile.model_id} "
              f"prompt_tokens={prompt_tokens} completion_tokens={completion_tokens}")

    def translate_exception(self, raw_exception: Exception) -> Exception:
        """Standardized adapter wrapper to normalize provider errors to OS exceptions."""
        return RuntimeError(f"Unified Adapter Error: {str(raw_exception)}")
