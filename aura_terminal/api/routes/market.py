"""
Market routes — Capa 2
GET /market/macro        → MacroSnapshot (todos los indicadores FRED)
GET /market/macro/{id}   → MacroIndicator individual
GET /market/news         → Noticias generales (Finnhub)
GET /market/news/{sym}   → Noticias de empresa
GET /market/sentiment    → Sentimiento Finnhub
GET /market/quote        → Quote acción (Alpaca)
GET /market/quotes       → Quotes múltiples
GET /market/bars         → Barras OHLCV acción
GET /market/crypto/*     → Crypto data (CCXT/Binance)
"""

import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import (
    MacroSnapshot,
    MacroIndicator,
    NewsItem,
    QuoteData,
    CryptoTicker,
    OHLCBar,
    SentimentData,
    OrderBook,
    RecentTrade,
)
from aura_terminal.core.redis_client import get_redis
from aura_terminal.data_pipeline.fred_client import (
    get_macro_snapshot,
    get_indicator,
    snapshot_to_cache_dict,
    SERIES_CATALOG,
    TTL_BY_FREQUENCY,
)
from aura_terminal.data_pipeline.finnhub_client import (
    get_market_news as finnhub_get_market_news,
    get_company_news as finnhub_get_company_news,
    get_sentiment as finnhub_get_sentiment,
    get_quotes_batch as finnhub_get_quotes_batch,
)
from aura_terminal.data_pipeline.alpaca_client import (
    get_stock_quote,
    get_stock_bars,
    get_multiple_quotes,
)
from aura_terminal.data_pipeline.ccxt_client import (
    get_crypto_ticker as ccxt_get_ticker,
    get_crypto_ohlcv as ccxt_get_ohlcv,
    get_multiple_tickers as ccxt_get_multiple_tickers,
    get_order_book as ccxt_get_order_book,
    get_recent_trades as ccxt_get_recent_trades,
)

router = APIRouter(prefix="/market", tags=["market"])

CACHE_KEY_SNAPSHOT = "macro:snapshot"


@router.get("/macro", response_model=MacroSnapshot)
async def macro_snapshot(
    series: Optional[str] = Query(
        default=None,
        description="Comma-separated FRED series IDs. Example: FEDFUNDS,DGS10",
    )
):
    """
    Devuelve el último valor de los indicadores macro de la Fed Reserve.
    Respuesta cacheada en Redis con TTL de 4h (series diarias).
    """
    series_ids = [s.strip().upper() for s in series.split(",")] if series else None
    cache_key = CACHE_KEY_SNAPSHOT if series_ids is None else f"macro:{'_'.join(sorted(series_ids))}"

    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return MacroSnapshot(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching FRED data (key={cache_key})")
    try:
        snapshot = await get_macro_snapshot(series_ids)
    except Exception as e:
        logger.error(f"FRED fetch failed: {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching FRED data: {e}")

    if not snapshot.indicators:
        raise HTTPException(status_code=502, detail="No FRED data returned")

    if redis is not None:
        try:
            ttl = settings.TTL_DAILY
            await redis.setex(cache_key, ttl, json.dumps(snapshot_to_cache_dict(snapshot)))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return snapshot


@router.get("/macro/catalog/list")
async def macro_catalog():
    """Lista todas las series FRED disponibles en el sistema."""
    return {"series": SERIES_CATALOG}


@router.get("/macro/{series_id}", response_model=MacroIndicator)
async def macro_indicator(series_id: str):
    """
    Devuelve el último valor de una serie FRED específica.
    Cacheo individual con TTL según frecuencia de la serie.
    """
    series_id = series_id.upper()
    meta = next((s for s in SERIES_CATALOG if s["id"] == series_id), None)
    if meta is None:
        valid = [s["id"] for s in SERIES_CATALOG]
        raise HTTPException(
            status_code=404,
            detail=f"Serie '{series_id}' no encontrada. Válidas: {valid}",
        )

    cache_key = f"macro:series:{series_id}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            return MacroIndicator(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    try:
        indicator = await get_indicator(series_id)
    except Exception as e:
        logger.error(f"FRED fetch {series_id} failed: {e}")
        raise HTTPException(status_code=502, detail=str(e))

    if redis is not None:
        try:
            ttl = TTL_BY_FREQUENCY[meta["frequency"]]
            await redis.setex(cache_key, ttl, indicator.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return indicator


# ── Finnhub News ────────────────────────────────────────────────────────────


@router.get("/news", response_model=list[NewsItem])
async def market_news(category: str = "general"):
    """Noticias generales del mercado vía Finnhub."""
    if not settings.FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="FINNHUB_API_KEY not configured")

    cache_key = f"news:market:{category}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching market news (category={category})")
    try:
        news = await finnhub_get_market_news(category)
    except Exception as e:
        logger.error(f"Finnhub market news failed: {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching market news: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 120, json.dumps([n.model_dump() for n in news]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return news


@router.get("/news/{symbol}", response_model=list[NewsItem])
async def company_news(symbol: str):
    """Noticias de una empresa específica vía Finnhub."""
    if not settings.FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="FINNHUB_API_KEY not configured")

    symbol = symbol.upper()
    cache_key = f"news:company:{symbol}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching company news ({symbol})")
    try:
        news = await finnhub_get_company_news(symbol)
    except Exception as e:
        logger.error(f"Finnhub company news failed ({symbol}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching company news: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 120, json.dumps([n.model_dump() for n in news]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return news


@router.get("/sentiment/{symbol}", response_model=SentimentData)
async def sentiment(symbol: str):
    """Sentimiento de una empresa vía Finnhub."""
    if not settings.FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="FINNHUB_API_KEY not configured")

    symbol = symbol.upper()
    cache_key = f"sentiment:{symbol}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return SentimentData(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching sentiment ({symbol})")
    try:
        data = await finnhub_get_sentiment(symbol)
    except Exception as e:
        logger.error(f"Finnhub sentiment failed ({symbol}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching sentiment: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 300, data.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return data


# ── Stock Quotes (Alpaca) ───────────────────────────────────────────────────


@router.get("/quote/{symbol}", response_model=QuoteData)
async def stock_quote(symbol: str):
    """Cotización en tiempo real de una acción vía Alpaca."""
    if not settings.ALPACA_API_KEY:
        raise HTTPException(status_code=503, detail="ALPACA_API_KEY not configured")

    symbol = symbol.upper()
    cache_key = f"quote:stock:{symbol}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return QuoteData(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching stock quote ({symbol})")
    try:
        quote = await get_stock_quote(symbol)
    except Exception as e:
        logger.error(f"Alpaca stock quote failed ({symbol}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching stock quote: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 5, quote.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return quote


@router.get("/quotes", response_model=list[QuoteData])
async def stock_quotes(symbols: str = Query(..., description="Comma-separated symbols")):
    """Cotizaciones múltiples de acciones vía Alpaca."""
    if not settings.ALPACA_API_KEY:
        raise HTTPException(status_code=503, detail="ALPACA_API_KEY not configured")

    symbols_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not symbols_list:
        raise HTTPException(status_code=400, detail="No symbols provided")

    sorted_key = ",".join(sorted(symbols_list))
    cache_key = f"quotes:stock:{sorted_key}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching stock quotes ({sorted_key})")
    try:
        quotes = await get_multiple_quotes(symbols_list)
    except Exception as e:
        logger.error(f"Alpaca multiple quotes failed: {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching stock quotes: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 5, json.dumps([q.model_dump() for q in quotes]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return quotes


@router.get("/bars/{symbol}", response_model=list[OHLCBar])
async def stock_bars(symbol: str, timeframe: str = "1Day", limit: int = 100):
    """Barras OHLCV históricas de una acción vía Alpaca."""
    if not settings.ALPACA_API_KEY:
        raise HTTPException(status_code=503, detail="ALPACA_API_KEY not configured")

    symbol = symbol.upper()
    cache_key = f"bars:{symbol}:{timeframe}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching stock bars ({symbol}, {timeframe})")
    try:
        bars = await get_stock_bars(symbol, timeframe, limit)
    except Exception as e:
        logger.error(f"Alpaca stock bars failed ({symbol}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching stock bars: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 60, json.dumps([b.model_dump() for b in bars]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return bars


# ── Market Indices (Finnhub) ────────────────────────────────────────────────

# Mapeo: símbolo Finnhub → símbolo display en el frontend
_INDEX_FINNHUB_MAP = {
    "SPY": "SPY",    # S&P 500 ETF
    "QQQ": "QQQ",    # Nasdaq 100 ETF
    "GLD": "GLD",    # Gold ETF
    "^VIX": "VIX",   # CBOE Volatility Index
    "UUP": "DXY",    # USD Index proxy (PowerShares DB Dollar Bullish)
    "USO": "OIL",    # WTI Oil ETF proxy
}


@router.get("/indices", response_model=list[QuoteData])
async def market_indices():
    """
    Cotizaciones en tiempo real de índices y ETFs clave (SPY, QQQ, GLD, VIX, DXY, OIL).
    Usa Finnhub como fuente con símbolos proxy para índices no directamente cotizables.
    """
    if not settings.FINNHUB_API_KEY:
        raise HTTPException(status_code=503, detail="FINNHUB_API_KEY not configured")

    cache_key = "market:indices"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug("Cache hit → market indices")
            import json as _json
            return _json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info("Fetching market indices from Finnhub...")
    finnhub_symbols = list(_INDEX_FINNHUB_MAP.keys())
    alias = {k: v for k, v in _INDEX_FINNHUB_MAP.items() if k != v}

    try:
        quotes = await finnhub_get_quotes_batch(finnhub_symbols, symbol_alias=alias)
    except Exception as e:
        logger.error(f"Finnhub indices fetch failed: {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching indices: {e}")

    if redis is not None and quotes:
        try:
            import json as _json
            await redis.setex(cache_key, 30, _json.dumps([q.model_dump() for q in quotes]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")

    return quotes


# ── Crypto (CCXT / Binance) ─────────────────────────────────────────────────


@router.get("/crypto/ticker/{symbol}", response_model=CryptoTicker)
async def crypto_ticker(symbol: str):
    """Ticker crypto en tiempo real vía CCXT (Binance)."""
    symbol = symbol.upper()
    pair = f"{symbol}/USDT"
    cache_key = f"crypto:ticker:{symbol}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return CryptoTicker(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching crypto ticker ({pair})")
    try:
        ticker = await ccxt_get_ticker(pair)
    except Exception as e:
        logger.error(f"CCXT crypto ticker failed ({pair}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching crypto ticker: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 5, ticker.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return ticker


@router.get("/crypto/tickers", response_model=list[CryptoTicker])
async def crypto_tickers(symbols: str = Query(default="BTC,ETH,SOL")):
    """Tickers crypto múltiples vía CCXT (Binance)."""
    symbols_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    if not symbols_list:
        raise HTTPException(status_code=400, detail="No symbols provided")

    sorted_key = ",".join(sorted(symbols_list))
    cache_key = f"crypto:tickers:{sorted_key}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    pairs = [f"{s}/USDT" for s in symbols_list]
    logger.info(f"Cache miss → fetching crypto tickers ({sorted_key})")
    try:
        tickers = await ccxt_get_multiple_tickers(pairs)
    except Exception as e:
        logger.error(f"CCXT crypto tickers failed: {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching crypto tickers: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 5, json.dumps([t.model_dump() for t in tickers]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return tickers


@router.get("/crypto/orderbook/{symbol}", response_model=OrderBook)
async def crypto_orderbook(symbol: str, limit: int = Query(default=20, le=50)):
    """
    Order book L2 de un par crypto via Binance (/api/v3/depth).
    Weight: 10 con limit=20. Sin API key requerida.
    """
    symbol = symbol.upper()
    pair = f"{symbol}/USDT"
    cache_key = f"crypto:orderbook:{symbol}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            import json as _json
            return OrderBook(**_json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable: {e}")

    try:
        book = await ccxt_get_order_book(pair, limit=limit)
    except Exception as e:
        logger.error(f"Order book failed ({pair}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching order book: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 2, book.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return book


@router.get("/crypto/trades/{symbol}", response_model=list[RecentTrade])
async def crypto_trades(symbol: str, limit: int = Query(default=20, le=50)):
    """
    Trades recientes de un par crypto via Binance (/api/v3/trades).
    Weight: 25. Sin API key requerida.
    """
    symbol = symbol.upper()
    pair = f"{symbol}/USDT"
    cache_key = f"crypto:trades:{symbol}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            import json as _json
            return _json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable: {e}")

    try:
        trades = await ccxt_get_recent_trades(pair, limit=limit)
    except Exception as e:
        logger.error(f"Recent trades failed ({pair}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching trades: {e}")

    if redis is not None:
        try:
            import json as _json
            await redis.setex(cache_key, 5, _json.dumps([t.model_dump() for t in trades]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return trades


@router.get("/crypto/ohlcv/{symbol}", response_model=list[OHLCBar])
async def crypto_ohlcv(symbol: str, timeframe: str = "1d", limit: int = 100):
    """Barras OHLCV crypto vía CCXT (Binance)."""
    symbol = symbol.upper()
    pair = f"{symbol}/USDT"
    cache_key = f"crypto:ohlcv:{symbol}:{timeframe}"
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.debug(f"Cache hit → {cache_key}")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info(f"Cache miss → fetching crypto OHLCV ({pair}, {timeframe})")
    try:
        bars = await ccxt_get_ohlcv(pair, timeframe, limit)
    except Exception as e:
        logger.error(f"CCXT crypto OHLCV failed ({pair}): {e}")
        raise HTTPException(status_code=502, detail=f"Error fetching crypto OHLCV: {e}")

    if redis is not None:
        try:
            await redis.setex(cache_key, 60, json.dumps([b.model_dump() for b in bars]))
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return bars
