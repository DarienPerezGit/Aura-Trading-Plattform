"""
Alpaca Client — US Stock Quotes & Bars
Capa 1: ingesta de datos de acciones USA via alpaca-py SDK
"""

import asyncio
from datetime import datetime, timezone

from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest, StockLatestQuoteRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import OHLCBar, QuoteData


# ── Timeframe mapping ────────────────────────────────────────────────────────

_TIMEFRAME_MAP = {
    "1Min":  TimeFrame.Minute,
    "5Min":  TimeFrame(5, TimeFrameUnit.Minute),
    "15Min": TimeFrame(15, TimeFrameUnit.Minute),
    "1Hour": TimeFrame.Hour,
    "1Day":  TimeFrame.Day,
    "1Week": TimeFrame.Week,
    "1Month": TimeFrame.Month,
}


# ── Client builder ───────────────────────────────────────────────────────────

def _build_alpaca() -> StockHistoricalDataClient:
    if not settings.ALPACA_API_KEY or not settings.ALPACA_SECRET_KEY:
        raise ValueError("ALPACA_API_KEY / ALPACA_SECRET_KEY no configuradas en .env")
    return StockHistoricalDataClient(
        api_key=settings.ALPACA_API_KEY,
        secret_key=settings.ALPACA_SECRET_KEY,
    )


# ── Sync helpers (ejecutar en thread) ────────────────────────────────────────

def _fetch_latest_quote_sync(client: StockHistoricalDataClient, symbol: str) -> dict:
    """Obtiene la cotización más reciente de un símbolo."""
    request = StockLatestQuoteRequest(symbol_or_symbols=symbol)
    response = client.get_stock_latest_quote(request)
    return response[symbol]


def _fetch_bars_sync(
    client: StockHistoricalDataClient,
    symbol: str,
    timeframe: TimeFrame,
    limit: int,
) -> list:
    """Obtiene barras históricas de un símbolo."""
    request = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe=timeframe,
        limit=limit,
    )
    response = client.get_stock_bars(request)
    return response[symbol]


# ── Async public API ─────────────────────────────────────────────────────────

async def get_stock_quote(symbol: str) -> QuoteData:
    """Obtiene la cotización más reciente de un símbolo (async-safe)."""
    client = _build_alpaca()
    raw = await asyncio.to_thread(_fetch_latest_quote_sync, client, symbol)
    logger.debug(f"Alpaca quote {symbol}: ask={raw.ask_price} bid={raw.bid_price}")

    mid_price = (raw.ask_price + raw.bid_price) / 2 if raw.ask_price and raw.bid_price else 0.0
    timestamp = raw.timestamp.isoformat() if raw.timestamp else datetime.now(timezone.utc).isoformat()

    return QuoteData(
        symbol=symbol,
        price=mid_price,
        change=0.0,            # Alpaca latest-quote no incluye cambio diario
        change_percent=0.0,
        high=0.0,
        low=0.0,
        open=0.0,
        prev_close=0.0,
        timestamp=timestamp,
    )


async def get_stock_bars(
    symbol: str,
    timeframe: str = "1Day",
    limit: int = 100,
) -> list[OHLCBar]:
    """Obtiene barras OHLCV históricas de un símbolo (async-safe)."""
    tf = _TIMEFRAME_MAP.get(timeframe)
    if tf is None:
        raise ValueError(
            f"Timeframe '{timeframe}' no soportado. Opciones: {list(_TIMEFRAME_MAP.keys())}"
        )

    client = _build_alpaca()
    raw_bars = await asyncio.to_thread(_fetch_bars_sync, client, symbol, tf, limit)
    logger.debug(f"Alpaca bars {symbol} ({timeframe}): {len(raw_bars)} bars fetched")

    bars: list[OHLCBar] = []
    for bar in raw_bars:
        bars.append(OHLCBar(
            timestamp=bar.timestamp.isoformat() if bar.timestamp else "",
            open=float(bar.open),
            high=float(bar.high),
            low=float(bar.low),
            close=float(bar.close),
            volume=float(bar.volume),
        ))
    return bars


async def get_multiple_quotes(
    symbols: list[str] | None = None,
) -> list[QuoteData]:
    """
    Obtiene cotizaciones de múltiples símbolos en paralelo.

    Args:
        symbols: lista de tickers (e.g. ["AAPL", "MSFT", "GOOGL"]).
                 None = ["AAPL", "MSFT", "GOOGL"].
    """
    if symbols is None:
        symbols = ["AAPL", "MSFT", "GOOGL"]

    logger.info(f"Fetching {len(symbols)} stock quotes...")
    tasks = [get_stock_quote(s) for s in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    quotes: list[QuoteData] = []
    for symbol, result in zip(symbols, results):
        if isinstance(result, Exception):
            logger.warning(f"Error fetching quote {symbol}: {result}")
        else:
            quotes.append(result)
    return quotes
