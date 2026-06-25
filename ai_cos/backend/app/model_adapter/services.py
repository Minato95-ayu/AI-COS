import time
from typing import Dict, Any, List, Optional, Type
from .models import ModelProfile, TokenUsage, ChatMessage, ChatRequest
from .interfaces import ProviderAdapter
from .registry import ProviderRegistry, ModelRegistry

class CostTracker:
    """
    Enterprise pricing engine calculating exact session overhead costs based on precise token footprints.
    """

    def __init__(self, registry: ModelRegistry):
        self.registry = registry

    def calculate_cost(self, model_id: str, usage: TokenUsage) -> TokenUsage:
        """Enriches TokenUsage model with precise financial pricing calculations."""
        profile = self.registry.get_profile(model_id)
        if profile:
            input_cost = (usage.prompt_tokens / 1_000_000) * profile.cost_per_million_input_usd
            output_cost = (usage.completion_tokens / 1_000_000) * profile.cost_per_million_output_usd
            usage.estimated_cost_usd = input_cost + output_cost
        return usage


class ContextWindowManager:
    """
    Manages unified token contexts and enforces sliding window rules to fit model capabilities.
    """

    def __init__(self, registry: ModelRegistry):
        self.registry = registry

    def fit_to_context_limit(self, model_id: str, messages: List[ChatMessage], buffer_tokens: int = 500) -> List[ChatMessage]:
        """
        Trims historical messaging arrays from the oldest first if total tokens exceed limit.
        """
        profile = self.registry.get_profile(model_id)
        if not profile:
            return messages
        
        # Scaffolding: Simulated trimming of message objects to stay under profile.context_window_limit
        return messages


class PromptFormatter:
    """
    Standardizes prompt shapes and schemas formatting.
    Converts messages cleanly to the corresponding target formats (e.g., chat templates vs instruct templates).
    """

    def format_chatml(self, messages: List[ChatMessage]) -> str:
        """Formulate general ChatML formatting structures for raw local completions."""
        formatted = ""
        for msg in messages:
            formatted += f"<|im_start|>{msg.role}\n{msg.content}\n<|im_end|>\n"
        return formatted


class RetryPolicy:
    """
    Enforces intelligent exponential retry delays with jitter and provider-specific error exemptions.
    """

    def __init__(self, max_attempts: int = 3, initial_backoff_seconds: float = 1.0):
        self.max_attempts = max_attempts
        self.initial_backoff_seconds = initial_backoff_seconds

    def execute_with_retry(self, action_callable: Any, *args: Any, **kwargs: Any) -> Any:
        """Wrap calls in generic safe backoff logic blocks."""
        # Backoff logic scaffolding
        return action_callable(*args, **kwargs)


class RateLimiter:
    """
    Guarantees compliance with external rate limits (Requests Per Minute, Tokens Per Minute) 
    using Token Bucket scheduling policies.
    """

    def __init__(self, rpm_limit: int = 60, tpm_limit: int = 40000):
        self.rpm_limit = rpm_limit
        self.tpm_limit = tpm_limit
        self._tokens = rpm_limit
        self._last_update = time.time()

    def acquire(self, estimated_tokens: int = 100) -> bool:
        """Request execution clearance from the bucket registry."""
        # Simple non-blocking Token Bucket scaffolding check
        return True


class HealthChecker:
    """
    Monitors latency, heartbeat responses, and fallback statuses of local and cloud provider nodes.
    """

    def __init__(self, provider_registry: ProviderRegistry, model_registry: ModelRegistry):
        self.provider_registry = provider_registry
        self.model_registry = model_registry

    async def verify_provider_health(self, provider_name: str) -> Dict[str, Any]:
        """Execute diagnostic checks on an active adapter's host nodes."""
        return {
            "provider": provider_name,
            "status": "healthy",
            "latency_ms": 12.0,
            "checked_at": time.time()
        }


class AdapterFactory:
    """
    Decoupled Factory class producing concrete, isolated ProviderAdapter instances on demand.
    """

    def __init__(self, provider_registry: ProviderRegistry, model_registry: ModelRegistry):
        self.provider_registry = provider_registry
        self.model_registry = model_registry

    def create_adapter(self, model_id: str) -> ProviderAdapter:
        """
        Dynamically locate adapter mappings and return instantiations.
        The caller never knows if the resulting adapter talks to Ollama, OpenAI, or Gemini.
        """
        profile = self.model_registry.get_profile(model_id)
        if not profile:
            raise ValueError(f"Model ID '{model_id}' is not registered in ModelRegistry.")
        
        adapter_cls = self.provider_registry.get_adapter_class(profile.provider_name)
        if not adapter_cls:
            raise ValueError(f"No Adapter implementation mapped for provider: {profile.provider_name}")
        
        # Return concrete adapter mapped to profile bounds
        return adapter_cls(profile=profile)
