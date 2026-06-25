from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from pydantic import BaseModel

class LLMRequest(BaseModel):
    prompt: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 1000
    stop_sequences: Optional[List[str]] = None
    system_instruction: Optional[str] = None

class LLMResponse(BaseModel):
    text: str
    prompt_tokens: int
    completion_tokens: int
    raw_response: Dict[str, Any]

class ILLMClient(ABC):
    """Abstract driver representing local model execution constraints."""
    
    @abstractmethod
    async def generate(self, request: LLMRequest) -> LLMResponse:
        """Asynchronously call model endpoint and wait for full completion payload."""
        pass

    @abstractmethod
    async def stream(self, request: LLMRequest) -> AsyncGenerator[str, None]:
        """Stream token-by-token text output for high responsiveness in UI layouts."""
        pass

    @abstractmethod
    async def embed(self, texts: List[str], model: str) -> List[List[float]]:
        """Generate high-dimensional semantic embeddings for storage and search."""
        pass\n