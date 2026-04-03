from pydantic import BaseModel
from typing import Optional


class MacroIndicator(BaseModel):
    series_id: str
    name: str
    value: float
    date: str           # YYYY-MM-DD del último dato disponible
    frequency: str      # daily | weekly | monthly
    unit: str


class MacroSnapshot(BaseModel):
    indicators: list[MacroIndicator]
    fetched_at: str     # ISO timestamp


class MacroSignal(BaseModel):
    signal: str                     # RISK_ON | RISK_OFF
    confidence: float               # 0.0 – 1.0
    reasoning: str
    key_factors: list[str]
    snapshot_date: Optional[str] = None
