"""
CCXT Client — Crypto Market Data via Binance
Capa 1: ingesta de datos crypto (tickers, OHLCV) via ccxt async
"""

import asyncio
import threading
from datetime import datetime, timezone

import ccxt

from aura_terminal.core.logger import logger
from aura_terminal.core.models import CryptoTicker, OHLCBar, OrderBook, OrderBookLevel, RecentTrade


_exchange: ccxt.binance | None = None
_exchange_lock = threading.RLock()
_markets_loaded = False


# ── Exchange builder ─────────────────────────────────────────────────────────

def _build_exchange() -> ccxt.binance:
    """Crea una instancia de Binance (pública, sin API key)."""
    return ccxt.binance({"enableRateLimit": True})


def _get_exchange() -> ccxt.binance:
    global _exchange, _markets_loaded

    with _exchange_lock:
        if _exchange is None:
            _exchange = _build_exchange()
            _markets_loaded = False

        if not _markets_loaded:
            logger.info("Loading Binance markets into shared CCXT exchange...")
            _exchange.load_markets()
            _markets_loaded = True

        return _exchange


def _run_exchange_call(method_name: str, *args, **kwargs):
    with _exchange_lock:
        exchange = _get_exchange()
        method = getattr(exchange, method_name)
        return method(*args, **kwargs)


def _fetch_ticker_sync(symbol: str) -> dict:
    return _run_exchange_call("fetch_ticker", symbol)


def _fetch_ohlcv_sync(symbol: str, timeframe: str, limit: int) -> list:
    return _run_exchange_call("fetch_ohlcv", symbol, timeframe, limit=limit)


def _fetch_order_book_sync(symbol: str, limit: int) -> dict:
    return _run_exchange_call("fetch_order_book", symbol, limit=limit)


def _fetch_recent_trades_sync(symbol: str, limit: int) -> list:
    return _run_exchange_call("fetch_trades", symbol, limit=limit)


def _warmup_exchange_sync() -> None:
    _get_exchange()


async def warmup_crypto_exchange() -> None:
    """Precarga mercados de Binance para evitar la primera request lenta."""
    await asyncio.to_thread(_warmup_exchange_sync)
    logger.info("Binance exchange warmed up.")


# ── Async public API ─────────────────────────────────────────────────────────

async def get_crypto_ticker(symbol: str = "BTC/USDT") -> CryptoTicker:
    """Obtiene el ticker actual de un par crypto (async-native)."""
    raw = await asyncio.to_thread(_fetch_ticker_sync, symbol)
    logger.debug(f"CCXT ticker {symbol}: {raw.get('last', 0)}")

    return CryptoTicker(
        symbol=symbol,
        price=raw.get("last", 0.0) or 0.0,
        change_24h=raw.get("change", 0.0) or 0.0,
        change_percent_24h=raw.get("percentage", 0.0) or 0.0,
        high_24h=raw.get("high", 0.0) or 0.0,
        low_24h=raw.get("low", 0.0) or 0.0,
        volume_24h=raw.get("quoteVolume", 0.0) or 0.0,
        timestamp=datetime.fromtimestamp(
            (raw.get("timestamp", 0) or 0) / 1000, tz=timezone.utc
        ).isoformat(),
    )


async def get_crypto_ohlcv(
    symbol: str = "BTC/USDT",
    timeframe: str = "1d",
    limit: int = 100,
) -> list[OHLCBar]:
    """Obtiene velas OHLCV para un par crypto (async-native)."""
    raw = await asyncio.to_thread(_fetch_ohlcv_sync, symbol, timeframe, limit)
    logger.debug(f"CCXT OHLCV {symbol} ({timeframe}): {len(raw)} bars fetched")

    bars: list[OHLCBar] = []
    for candle in raw:
        bars.append(OHLCBar(
            timestamp=datetime.fromtimestamp(
                candle[0] / 1000, tz=timezone.utc
            ).isoformat(),
            open=candle[1],
            high=candle[2],
            low=candle[3],
            close=candle[4],
            volume=candle[5],
        ))
    return bars


async def get_order_book(symbol: str = "BTC/USDT", limit: int = 20) -> OrderBook:
    """
    Obtiene el order book (L2) de un par crypto via Binance.
    GET /api/v3/depth — weight 10 con limit=20. Sin API key requerida.
    """
    raw = await asyncio.to_thread(_fetch_order_book_sync, symbol, limit)
    logger.debug(f"CCXT order book {symbol}: {len(raw['bids'])} bids, {len(raw['asks'])} asks")

    ts = datetime.fromtimestamp(
        (raw.get("timestamp") or 0) / 1000, tz=timezone.utc
    ).isoformat() if raw.get("timestamp") else datetime.now(timezone.utc).isoformat()

    return OrderBook(
        symbol=symbol,
        bids=[OrderBookLevel(price=float(b[0]), size=float(b[1])) for b in raw["bids"]],
        asks=[OrderBookLevel(price=float(a[0]), size=float(a[1])) for a in raw["asks"]],
        timestamp=ts,
    )


async def get_recent_trades(symbol: str = "BTC/USDT", limit: int = 20) -> list[RecentTrade]:
    """
    Obtiene los últimos trades de un par crypto via Binance.
    GET /api/v3/trades — weight 25. Sin API key requerida.
    """
    raw = await asyncio.to_thread(_fetch_recent_trades_sync, symbol, limit)
    logger.debug(f"CCXT recent trades {symbol}: {len(raw)} trades fetched")

    trades: list[RecentTrade] = []
    for t in raw:
        side = "buy" if t.get("side") == "buy" else "sell"
        # Binance taker side: si 'takerOrMaker' no está, usar 'isBuyerMaker'
        info = t.get("info", {})
        if "isBuyerMaker" in info:
            side = "sell" if info["isBuyerMaker"] else "buy"
        ts = datetime.fromtimestamp(
            (t.get("timestamp") or 0) / 1000, tz=timezone.utc
        ).isoformat() if t.get("timestamp") else datetime.now(timezone.utc).isoformat()
        trades.append(RecentTrade(
            price=float(t.get("price", 0)),
            size=float(t.get("amount", 0)),
            side=side,
            timestamp=ts,
        ))
    return trades


async def get_multiple_tickers(
    symbols: list[str] | None = None,
) -> list[CryptoTicker]:
    """
    Obtiene tickers de múltiples pares crypto en paralelo.

    Args:
        symbols: lista de pares (e.g. ["BTC/USDT", "ETH/USDT"]).
                 None = ["BTC/USDT", "ETH/USDT", "SOL/USDT"].
    """
    if symbols is None:
        symbols = ["BTC/USDT", "ETH/USDT", "SOL/USDT"]

    logger.info(f"Fetching {len(symbols)} crypto tickers...")
    tasks = [get_crypto_ticker(s) for s in symbols]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    tickers: list[CryptoTicker] = []
    for symbol, result in zip(symbols, results):
        if isinstance(result, Exception):
            logger.warning(f"Error fetching ticker {symbol}: {result}")
        else:
            tickers.append(result)
    return tickers
