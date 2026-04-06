"""
CCXT Client — Crypto Market Data via Binance
Capa 1: ingesta de datos crypto (tickers, OHLCV) via ccxt async
"""

import asyncio
from datetime import datetime, timezone

import ccxt.async_support as ccxt

from aura_terminal.core.logger import logger
from aura_terminal.core.models import CryptoTicker, OHLCBar, OrderBook, OrderBookLevel, RecentTrade


# ── Exchange builder ─────────────────────────────────────────────────────────

def _build_exchange() -> ccxt.binance:
    """Crea una instancia de Binance (pública, sin API key)."""
    return ccxt.binance({"enableRateLimit": True})


# ── Async public API ─────────────────────────────────────────────────────────

async def get_crypto_ticker(symbol: str = "BTC/USDT") -> CryptoTicker:
    """Obtiene el ticker actual de un par crypto (async-native)."""
    exchange = _build_exchange()
    try:
        raw = await exchange.fetch_ticker(symbol)
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
    finally:
        await exchange.close()


async def get_crypto_ohlcv(
    symbol: str = "BTC/USDT",
    timeframe: str = "1d",
    limit: int = 100,
) -> list[OHLCBar]:
    """Obtiene velas OHLCV para un par crypto (async-native)."""
    exchange = _build_exchange()
    try:
        raw = await exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
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
    finally:
        await exchange.close()


async def get_order_book(symbol: str = "BTC/USDT", limit: int = 20) -> OrderBook:
    """
    Obtiene el order book (L2) de un par crypto via Binance.
    GET /api/v3/depth — weight 10 con limit=20. Sin API key requerida.
    """
    exchange = _build_exchange()
    try:
        raw = await exchange.fetch_order_book(symbol, limit=limit)
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
    finally:
        await exchange.close()


async def get_recent_trades(symbol: str = "BTC/USDT", limit: int = 20) -> list[RecentTrade]:
    """
    Obtiene los últimos trades de un par crypto via Binance.
    GET /api/v3/trades — weight 25. Sin API key requerida.
    """
    exchange = _build_exchange()
    try:
        raw = await exchange.fetch_trades(symbol, limit=limit)
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
    finally:
        await exchange.close()


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
