"""
Alpaca Client — US Stock Quotes & Bars
Capa 1: ingesta de datos de acciones USA via alpaca-py SDK
"""

import asyncio
from datetime import datetime, timedelta, timezone

from alpaca.data.enums import DataFeed
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest, StockSnapshotRequest
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

_LOOKBACK_BY_TIMEFRAME = {
    "1Min": timedelta(days=2),
    "5Min": timedelta(days=5),
    "15Min": timedelta(days=10),
    "1Hour": timedelta(days=30),
    "1Day": timedelta(days=365),
    "1Week": timedelta(days=365 * 3),
    "1Month": timedelta(days=365 * 10),
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

def _fetch_snapshots_sync(
    client: StockHistoricalDataClient,
    symbols: list[str],
) -> dict:
    """Obtiene snapshots de múltiples símbolos (precio, cambio, high, low)."""
    request = StockSnapshotRequest(symbol_or_symbols=symbols)
    return client.get_stock_snapshot(request)


def _fetch_bars_sync(
    client: StockHistoricalDataClient,
    symbol: str,
    timeframe_name: str,
    timeframe: TimeFrame,
    limit: int,
) -> list:
    """Obtiene barras históricas de un símbolo."""
    lookback = _LOOKBACK_BY_TIMEFRAME.get(timeframe_name, timedelta(days=365))
    request = StockBarsRequest(
        symbol_or_symbols=symbol,
        timeframe=timeframe,
        start=datetime.now(timezone.utc) - lookback,
        limit=limit,
        feed=DataFeed.IEX,
    )
    response = client.get_stock_bars(request)
    bars = response.data.get(symbol, []) if hasattr(response, "data") else response.get(symbol, [])
    if not bars:
        raise ValueError(f"No bars returned for {symbol}")
    return bars


# ── Snapshot → QuoteData conversion ─────────────────────────────────────────

def _snapshot_to_quote(symbol: str, snap) -> QuoteData:
    """Convierte un Alpaca Snapshot a QuoteData con cambio diario real."""
    latest_trade = getattr(snap, "latest_trade", None)
    daily_bar = getattr(snap, "daily_bar", None)
    prev_bar = getattr(snap, "previous_daily_bar", None)
    latest_quote = getattr(snap, "latest_quote", None)

    # Precio: trade > mid de quote > 0
    if latest_trade and getattr(latest_trade, "price", None):
        price = float(latest_trade.price)
        ts = latest_trade.timestamp.isoformat() if latest_trade.timestamp else datetime.now(timezone.utc).isoformat()
    elif latest_quote and getattr(latest_quote, "ask_price", None) and getattr(latest_quote, "bid_price", None):
        price = float((latest_quote.ask_price + latest_quote.bid_price) / 2)
        ts = latest_quote.timestamp.isoformat() if latest_quote.timestamp else datetime.now(timezone.utc).isoformat()
    else:
        price = 0.0
        ts = datetime.now(timezone.utc).isoformat()

    # Cambio diario desde barra anterior
    prev_close = float(prev_bar.close) if prev_bar and getattr(prev_bar, "close", None) else 0.0
    change = round(price - prev_close, 4) if prev_close else 0.0
    change_pct = round((change / prev_close) * 100, 4) if prev_close else 0.0

    # High / Low / Open del día
    high = float(daily_bar.high) if daily_bar and getattr(daily_bar, "high", None) else 0.0
    low = float(daily_bar.low) if daily_bar and getattr(daily_bar, "low", None) else 0.0
    open_ = float(daily_bar.open) if daily_bar and getattr(daily_bar, "open", None) else 0.0

    logger.debug(f"Alpaca snapshot {symbol}: price={price:.2f} change={change_pct:.2f}%")

    return QuoteData(
        symbol=symbol,
        price=price,
        change=change,
        change_percent=change_pct,
        high=high,
        low=low,
        open=open_,
        prev_close=prev_close,
        timestamp=ts,
    )


# ── Async public API ─────────────────────────────────────────────────────────

async def get_stock_quote(symbol: str) -> QuoteData:
    """Obtiene cotización con cambio diario real via Alpaca snapshot (async-safe)."""
    client = _build_alpaca()
    snapshots = await asyncio.to_thread(_fetch_snapshots_sync, client, [symbol])
    snap = snapshots.get(symbol)
    if snap is None:
        raise ValueError(f"No snapshot returned for {symbol}")
    return _snapshot_to_quote(symbol, snap)


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
    raw_bars = await asyncio.to_thread(_fetch_bars_sync, client, symbol, timeframe, tf, limit)
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
    Obtiene cotizaciones de múltiples símbolos en una sola llamada batch (snapshot).

    Args:
        symbols: lista de tickers (e.g. ["AAPL", "MSFT", "GOOGL"]).
                 None = ["AAPL", "MSFT", "GOOGL"].
    """
    if symbols is None:
        symbols = ["AAPL", "MSFT", "GOOGL"]

    logger.info(f"Fetching {len(symbols)} stock snapshots from Alpaca...")
    client = _build_alpaca()
    try:
        snapshots = await asyncio.to_thread(_fetch_snapshots_sync, client, symbols)
    except Exception as e:
        logger.error(f"Alpaca batch snapshot failed: {e}")
        return []

    quotes: list[QuoteData] = []
    for symbol in symbols:
        snap = snapshots.get(symbol)
        if snap is None:
            logger.warning(f"No snapshot for {symbol}")
            continue
        try:
            quotes.append(_snapshot_to_quote(symbol, snap))
        except Exception as e:
            logger.warning(f"Error parsing snapshot for {symbol}: {e}")
    return quotes
