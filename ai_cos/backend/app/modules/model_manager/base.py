from abc import ABC
from .interfaces import IModelManager
from .config import ModelConfigSettings
from .repository import ModelManagerRepository

class BaseModelManager(IModelManager, ABC):
    """Abstract base controller wrapping VRAM limitations and hardware checks."""
    
    def __init__(self, config: ModelConfigSettings, repository: ModelManagerRepository):
        self.config = config
        self.repository = repository

    def calculate_gpu_temperature(self) -> float:
        """System hardware check stub."""
        return 58.5
