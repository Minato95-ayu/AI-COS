from typing import List
from .base import BaseSecurity
from .models import GuardrailRule, ScanResult

class SecurityService(BaseSecurity):
    """Concrete secure gatekeeper scanner service checking prompt boundaries."""
    
    async def scan_prompt(self, agent_id: str, prompt: str) -> ScanResult:
        violations = []
        if self.config.enable_pii_scanner and self.contains_pii_pattern(prompt):
            violations.append("PII_LEAK_EMAIL")
            
        is_safe = len(violations) == 0
        return ScanResult(
            is_safe=is_safe,
            confidence_score=0.99,
            violations=violations,
            sanitized_prompt=prompt if is_safe else "[REDACTED]"
        )

    async def add_guardrail_rule(self, rule: GuardrailRule) -> GuardrailRule:
        await self.repository.save_rule(rule)
        return rule
