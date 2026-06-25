# Model Adapter Layer

The `model_adapter` provides a unified, provider-independent bridging interface. It isolates the rest of the enterprise AI Operating System from API differences, pricing variations, and connectivity paradigms of LLM engines.

## Architectures & Capabilities

- **Completely Provider-Agnostic**: Identical interfaces support standard and streaming inferences regardless of vendor (Gemini, Claude, GPT, Ollama, OpenRouter).
- **In-Flight Token & Cost Accounting**: Cost trackers inspect incoming and outgoing inputs to update active credit balance sheets.
- **Context Window Management**: Sliding window queues automatically prune dialogue loops before limits are breached.
- **Rate-Limiting & High Availability Pools**: Dynamic token bucket limits prevent API lockouts, with automatic fallbacks to backup providers.

## Component Layout

1. **`interfaces.py`**: Rigid contracts defining input formats (`ProviderAdapter`) and smart orchestration selection guidelines (`ModelSelector`).
2. **`base.py`**: Base wrappers hosting telemetry log callbacks and standardizing runtime exceptions.
3. **`models.py`**: Strict Pydantic structures for chat contexts, usage metrics, token buffers, and hardware capabilities.
4. **`registry.py`**: Stores active profiles, costs, and adapter class maps.
5. **`services.py`**: Standardizes system formatting, rate limiters, adapter factories, and backoff executors.
