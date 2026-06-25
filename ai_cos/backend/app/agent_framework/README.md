# Agent Framework Module

The `Agent Framework` provides the core reusable foundation for establishing an enterprise-wide AI employee work pool. It abstracts execution mechanics, memory layers, and peer communication networks, and remains completely LLM-agnostic.

## Key Features

1. **Model Agnostic**: Can hook into local LLMs (Ollama with Llama/Qwen) or cloud APIs (Gemini, Claude, GPT) by mapping the BaseAgent `execute_task` loop.
2. **Highly Scalable**: Thin memory buffers and state structures allow thousands of concurrent instances.
3. **P2P Communication**: Agents interact directly or subscribe to departmental message streams.
4. **Lifecycle Hooks**: Proper orchestration triggers for instantiation, active work, logging, metrics, and teardown.
5. **Decoupled Security**: Fine-grained ACL permissions specify allowed tools, tokens, and storage pathways.

## Files In This Directory

- `enums.py`: Holds role listings (`AgentRole`), tracking structures (`AgentState`), and strategy models (`ReasoningMode`).
- `models.py`: Structural Pydantic models modeling context buffers, task requests, result structures, and telemetry metrics.
- `interfaces.py`: Complete interfaces governing abstract memory (`AgentMemory`), peer-to-peer exchanges (`AgentCommunication`), and execution hooks (`AgentLifecycle`).
- `base.py`: Abstract class `BaseAgent` serving as the structural parent of all AI corporate roles.
