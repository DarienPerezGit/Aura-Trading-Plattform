"""
Finnhub Client — Market News, Company News, Quotes & Sentiment
Capa 1: ingesta de datos de mercado via finnhub-python SDK
"""

import asyncio
from datetime import datetime, timedelta

import finnhub

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import NewsItem, QuoteData, SentimentData


# ── Client builder ───────────────────────────────────────────────────────────

def _build_finnhub() -> finnhub.Client:
    if not settings.FINNHUB_API_KEY:
        raise ValueError("FINNHUB_API_KEY no configurada en .env")
    return finnhub.Client(api_key=settings.FINNHUB_API_KEY)


# ── Sync helpers (ejecutar en thread) ────────────────────────────────────────

def _fetch_market_news_sync(client: finnhub.Client, category: str) -> list[dict]:
    """Obtiene noticias generales del mercado."""
    return client.general_news(category, min_id=0)


def _fetch_company_news_sync(client: finnhub.Client, symbol: str) -> list[dict]:
    """Obtiene noticias de una compañía en los últimos 30 días."""
    today = datetime.utcnow().strftime("%Y-%m-%d")
    from_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%d")
    return client.company_news(symbol, _from=from_date, to=today)


def _fetch_quote_sync(client: finnhub.Client, symbol: str) -> dict:
    """Obtiene la cotización actual de un símbolo."""
    return client.quote(symbol)


def _fetch_sentiment_sync(client: finnhub.Client, symbol: str) -> dict:
    """Obtiene el sentimiento de noticias para un símbolo."""
    return client.news_sentiment(symbol)


# ── Async public API ─────────────────────────────────────────────────────────

async def get_market_news(category: str = "general") -> list[NewsItem]:
    """Obtiene las últimas 20 noticias del mercado (async-safe)."""
    client = _build_finnhub()
    raw = await asyncio.to_thread(_fetch_market_news_sync, client, category)
    logger.debug(f"Finnhub market news: {len(raw)} items fetched")

    items: list[NewsItem] = []
    for article in raw[:20]:
        items.append(NewsItem(
            id=str(article.get("id", "")),
            headline=article.get("headline", ""),
            source=article.get("source", ""),
            url=article.get("url", ""),
            summary=article.get("summary", ""),
            timestamp=datetime.utcfromtimestamp(
                article.get("datetime", 0)
            ).isoformat() + "Z",
            symbols=article.get("related", "").split(",") if article.get("related") else [],
        ))
    return items


async def get_company_news(symbol: str) -> list[NewsItem]:
    """Obtiene las últimas 10 noticias de una compañía (async-safe)."""
    client = _build_finnhub()
    raw = await asyncio.to_thread(_fetch_company_news_sync, client, symbol)
    logger.debug(f"Finnhub company news for {symbol}: {len(raw)} items fetched")

    items: list[NewsItem] = []
    for article in raw[:10]:
        items.append(NewsItem(
            id=str(article.get("id", "")),
            headline=article.get("headline", ""),
            source=article.get("source", ""),
            url=article.get("url", ""),
            summary=article.get("summary", ""),
            timestamp=datetime.utcfromtimestamp(
                article.get("datetime", 0)
            ).isoformat() + "Z",
            symbols=article.get("related", "").split(",") if article.get("related") else [],
        ))
    return items


async def get_quote(symbol: str) -> QuoteData:
    """Obtiene la cotización actual de un símbolo (async-safe)."""
    client = _build_finnhub()
    raw = await asyncio.to_thread(_fetch_quote_sync, client, symbol)
    logger.debug(f"Finnhub quote {symbol}: {raw.get('c', 0)}")

    current = raw.get("c", 0.0)
    prev_close = raw.get("pc", 0.0)
    change = current - prev_close
    change_pct = (change / prev_close * 100) if prev_close else 0.0

    return QuoteData(
        symbol=symbol,
        price=current,
        change=round(change, 4),
        change_percent=round(change_pct, 4),
        high=raw.get("h", 0.0),
        low=raw.get("l", 0.0),
        open=raw.get("o", 0.0),
        prev_close=prev_close,
        timestamp=datetime.utcfromtimestamp(raw.get("t", 0)).isoformat() + "Z",
    )


async def get_sentiment(symbol: str) -> SentimentData:
    """Obtiene el sentimiento de noticias para un símbolo (async-safe)."""
    client = _build_finnhub()
    raw = await asyncio.to_thread(_fetch_sentiment_sync, client, symbol)
    logger.debug(f"Finnhub sentiment {symbol}: {raw}")

    sentiment = raw.get("sentiment", {})
    buzz = raw.get("buzz", {})

    return SentimentData(
        symbol=symbol,
        score=sentiment.get("score", 0.0),
        buzz=buzz.get("buzz", 0.0),
        articles_count=buzz.get("articlesInLastWeek", 0),
    )
