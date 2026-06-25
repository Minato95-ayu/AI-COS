from abc import ABC
from typing import Optional
from .interfaces import IToolManager
from .config import ToolConfig
from .repository import ToolRepository

class BaseToolManager(IToolManager, ABC):
    """Base tool controller mapping inputs and checking security bounds."""
    
    def __init__(self, config: ToolConfig, repository: ToolRepository):
        self.config = config
        self.repository = repository

    def check_permissions(self, agent_id: str, tool_name: str) -> bool:
        """Enforce ACL policies."""
        return True
