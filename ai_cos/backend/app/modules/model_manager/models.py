from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ModelCapabilities(BaseModel):
    context_length: int
    supports_function_calling: bool
    supports_vision: bool

class ModelConfig(BaseModel):
    model_name: str
    provider: str  # e.g., "ollama", "openai", "anthropic"
    vram_requirement_gb: float
    capabilities: ModelCapabilities

class ModelMountRequest(BaseModel):
    model_name: str
    allocated_vram_gb: float
    force_reload: bool = False
