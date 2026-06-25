from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List
from .models import ChatRequest, ChatResponse, ModelProfile, StreamingResponse

class ProviderAdapter(ABC):
    """
    Interface defining the rigid contract for all Model/API Providers.
    Every adapter (Ollama, OpenAI, Anthropic, Gemini, etc.) must implement this exactly.
    """

    @abstractmethod
    async def chat(self, request: ChatRequest) -> ChatResponse:
        """Execute a standard chat completion request."""
        pass

    @abstractmethod
    async def stream_chat(self, request: ChatRequest) -> AsyncGenerator[StreamingResponse, None]:
        """Execute a streaming chat completion request returning token chunks."""
        pass

    @abstractmethod
    async def count_tokens(self, text: str) -> int:
        """Count the number of tokens in the given input sequence."""
        pass


class ModelSelector(ABC):
    """
    Interface governing automatic routing and fallback strategy selections.
    Selects the optimal model and provider based on requirements, cost thresholds, and latency metrics.
    """

    @abstractmethod
    def select_best_model(self, required_capabilities: List[str], max_cost_limit: float) -> ModelProfile:
        """Dynamically find the most appropriate model profile from the active registry."""
        pass

    @abstractmethod
    def get_fallback_chain(self, primary_model_id: str) -> List[ModelProfile]:
        """Retrieve a list of fallback models when the primary fails."""
        pass
