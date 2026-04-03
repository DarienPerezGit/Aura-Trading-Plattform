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


# ── Market Data Models ───────────────────────────────────────────────────────

class NewsItem(BaseModel):
    id: str
    headline: str
    source: str
    url: str
    summary: str
    timestamp: str                  # ISO
    symbols: list[str]
    sentiment: Optional[float] = None  # -1 to 1


class QuoteData(BaseModel):
    symbol: str
    price: float
    change: float
    change_percent: float
    high: float
    low: float
    open: float
    prev_close: float
    timestamp: str


class CryptoTicker(BaseModel):
    symbol: str
    price: float
    change_24h: float
    change_percent_24h: float
    high_24h: float
    low_24h: float
    volume_24h: float
    timestamp: str


class OHLCBar(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float


class SentimentData(BaseModel):
    symbol: str
    score: float                    # -1 to 1
    buzz: float
    articles_count: int


class NewsSentimentSignal(BaseModel):
    overall_sentiment: str          # positivo | negativo | neutral
    score: float                    # -1.0 to 1.0
    summary: str
    key_themes: list[str]
    impacted_assets: list[str]
    generated_at: Optional[str] = None
