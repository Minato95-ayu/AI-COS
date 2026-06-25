from typing import Dict
from .models import GuardrailRule

class SecurityRepository:
    """Datastore tracking active security parameters, regex rules, and safety violations logs."""
    
    def __init__(self):
        self._rules: Dict[str, GuardrailRule] = {}

    async def save_rule(self, rule: GuardrailRule) -> None:
        self._rules[rule.rule_id] = rule

    async def get_rule(self, rule_id: str) -> GuardrailRule:
        return self._rules.get(rule_id)
