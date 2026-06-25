from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class GuardrailRule(BaseModel):
    rule_id: str
    rule_type: str  # "pii_leak", "prompt_injection", "toxic_language"
    regex_pattern: str
    severity: str = "high"

class ScanResult(BaseModel):
    is_safe: bool
    confidence_score: float
    violations: List[str] = Field(default_factory=list)
    sanitized_prompt: Optional[str] = None
