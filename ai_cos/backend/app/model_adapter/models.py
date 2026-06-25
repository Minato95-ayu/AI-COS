from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class ModelCapability(BaseModel):
    supports_structured_output: bool = Field(default=False)
    supports_vision: bool = Field(default=False)
    supports_function_calling: bool = Field(default=False)
    supports_embeddings: bool = Field(default=False)
    custom_attributes: Dict[str, Any] = Field(default_factory=dict)

class ModelProfile(BaseModel):
    model_id: str = Field(..., description="Unique slug identifying the model, e.g., 'gpt-4o' or 'qwen-72b-instruct'")
    provider_name: str = Field(..., description="Provider label, e.g., 'openai', 'ollama', 'anthropic'")
    context_window_limit: int = Field(..., description="Max token size of the model's unified context window")
    cost_per_million_input_usd: float = Field(default=0.0)
    cost_per_million_output_usd: float = Field(default=0.0)
    capabilities: ModelCapability = Field(default_factory=ModelCapability)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class TokenUsage(BaseModel):
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    estimated_cost_usd: float = 0.0

class ChatMessage(BaseModel):
    role: str = Field(..., description="The role of the communicator, e.g., 'system', 'user', 'assistant', 'tool'")
    content: str = Field(..., description="Text content payload")
    name: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None

class ChatRequest(BaseModel):
    request_id: str
    model_id: str
    messages: List[ChatMessage]
    temperature: float = Field(default=0.0, ge=0.0, le=2.0)
    max_tokens: Optional[int] = None
    response_format: Optional[Dict[str, Any]] = None
    tools: Optional[List[Dict[str, Any]]] = None
    extra_params: Dict[str, Any] = Field(default_factory=dict)

class ChatResponse(BaseModel):
    response_id: str
    model_id: str
    message: ChatMessage
    usage: TokenUsage
    latency_ms: float
    finish_reason: str = "stop"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StreamingResponse(BaseModel):
    chunk_id: str
    text_delta: str
    is_last: bool = False
    usage_so_far: Optional[TokenUsage] = None
