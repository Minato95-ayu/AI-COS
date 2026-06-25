from typing import Set

class ModelManagerRepository:
    """Keeps track of mounted local and cloud model processes in memory."""
    
    def __init__(self):
        self._mounted_models: Set[str] = set()

    async def mark_model_mounted(self, model_name: str) -> None:
        self._mounted_models.add(model_name)

    async def is_model_mounted(self, model_name: str) -> bool:
        return model_name in self._mounted_models
