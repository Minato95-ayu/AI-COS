from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ModelStatus(str, Enum):
    IDLE = "idle"
    LOADING = "loading"
    ACTIVE = "active"
    UNLOADED = "unloaded"

class ModelDetails(BaseModel):
    model_name: str
    size_bytes: int
    vram_requirement_bytes: int
    status: ModelStatus
    loaded_at: Optional[float] = None

class IModelManager(ABC):
    """Coordinates physical model allocation across available processing nodes."""

    @abstractmethod
    async def list_available_models(self) -> List[ModelDetails]:
        """Query registry for all valid, downloadable, or pre-loaded LLMs."""
        pass

    @abstractmethod
    async def request_model_mount(self, model_name: str) -> bool:
        """Trigger dynamic model swap into VRAM based on urgency and LRU queue caching."""
        pass

    @abstractmethod
    async def handle_inference_routing(self, task_complexity: str) -> str:
        """Resolve optimal model matching size, speed constraints, and current queue load."""
        pass

    @abstractmethod
    async def track_vram_overhead(self) -> Dict[str, Any]:
        """Monitor live graphics hardware statistics to avert Out Of Memory (OOM) failures."""
        pass\n