from abc import ABC, abstractmethod
from pydantic import BaseModel

class SystemGuardrails(BaseModel):
    max_tokens_per_minute: int = 80000
    daily_spend_cap_usd: float = 150.00
    approved_tool_domains: list[str] = ["github.com", "api.stripe.com"]
    enable_dangerous_commands: bool = False

class ICompanySettingsManager(ABC):
    """Abstract interface governing core administrative and safety thresholds."""
    
    @abstractmethod
    async def fetch_current_guardrails(self) -> SystemGuardrails:
        pass

    @abstractmethod
    async def update_guardrails(self, new_guardrails: SystemGuardrails) -> bool:
        pass

    @abstractmethod
    async def check_api_rate_limit(self, client_id: str) -> bool:
        pass\n