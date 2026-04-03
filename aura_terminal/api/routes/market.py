"""
Market routes — Capa 2
GET /market/macro        → MacroSnapshot (todos los indicadores FRED)
GET /market/macro/{id}   → MacroIndicator individual
"""

import json
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import MacroSnapshot, MacroIndicator
from aura_terminal.core.redis_client import get_redis
from aura_terminal.data_pipeline.fred_client import (
    get_macro_snapshot,
    get_indicator,
    snapshot_to_cache_dict,
    snapshot_from_cache_dict,
    SERIES_CATALOG,
    TTL_BY_FREQUENCY,
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


@router.get("/macro/catalog/list")
async def macro_catalog():
    """Lista todas las series FRED disponibles en el sistema."""
    return {"series": SERIES_CATALOG}
