from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel

class WorkspaceLimits(BaseModel):
    max_disk_space_mb: int = 500
    network_allowed: bool = False
    cpu_cores_limit: float = 1.0

class IWorkspaceSandbox(ABC):
    """Abstract definition of an isolated directory workspace assigned to an active task."""

    @abstractmethod
    async def write_file(self, filename: str, content: bytes) -> str:
        pass

    @abstractmethod
    async def read_file(self, filename: str) -> bytes:
        pass

    @abstractmethod
    async def execute_command(self, command: str, args: List[str]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def clean_sandbox(self) -> None:
        pass\n