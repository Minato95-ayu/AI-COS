from abc import ABC, abstractmethod
from typing import Dict, Any
from .models import GuardrailRule, ScanResult

class ISecurity(ABC):
    """Security guardrails engine verifying prompts, scanning for injection, and applying sandbox policies."""
    
    @abstractmethod
    async def scan_prompt(self, agent_id: str, prompt: str) -> ScanResult:
        """Evaluate input strings for SQL-injection, PII leakage, or override escapes."""
        pass

    @abstractmethod
    async def add_guardrail_rule(self, rule: GuardrailRule) -> GuardrailRule:
        """Register a defensive rule boundary inside security middleware."""
        pass
