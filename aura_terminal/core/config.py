from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_PROJECT_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_PROJECT_ROOT / ".env"), extra="ignore")

    # FRED
    FRED_API_KEY: str = ""

    # Finnhub
    FINNHUB_API_KEY: str = ""

    # Alpaca
    ALPACA_API_KEY: str = ""
    ALPACA_SECRET_KEY: str = ""
    ALPACA_BASE_URL: str = "https://paper-api.alpaca.markets"

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Cache TTLs (seconds)
    TTL_DAILY: int = 4 * 3600      # 4h — series diarias
    TTL_WEEKLY: int = 12 * 3600    # 12h — series semanales
    TTL_MONTHLY: int = 24 * 3600   # 24h — series mensuales


settings = Settings()
