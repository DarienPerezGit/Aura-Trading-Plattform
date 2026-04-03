"""
FRED Client — Federal Reserve Economic Data
Capa 1: ingesta de indicadores macro via fredapi
Series: FEDFUNDS, DGS10, DGS2, CPIAUCSL, PCEPILFE, M2SL, UNRATE, ICSA, DCOILWTICO, USEPUINDXD
"""

import asyncio
from datetime import datetime, date
import json

import fredapi
import pandas as pd

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import MacroIndicator, MacroSnapshot

# ── Catálogo de series ────────────────────────────────────────────────────────
SERIES_CATALOG: list[dict] = [
    {"id": "FEDFUNDS",    "name": "Fed Funds Rate",              "frequency": "monthly", "unit": "%"},
    {"id": "DGS10",       "name": "10Y Treasury Yield",          "frequency": "daily",   "unit": "%"},
    {"id": "DGS2",        "name": "2Y Treasury Yield",           "frequency": "daily",   "unit": "%"},
    {"id": "CPIAUCSL",    "name": "CPI (Inflación)",             "frequency": "monthly", "unit": "index"},
    {"id": "PCEPILFE",    "name": "PCE Core",                    "frequency": "monthly", "unit": "index"},
    {"id": "M2SL",        "name": "M2 Money Supply",             "frequency": "weekly",  "unit": "billions USD"},
    {"id": "UNRATE",      "name": "Unemployment Rate",           "frequency": "monthly", "unit": "%"},
    {"id": "ICSA",        "name": "Initial Jobless Claims",      "frequency": "weekly",  "unit": "thousands"},
    {"id": "DCOILWTICO",  "name": "WTI Crude Oil",               "frequency": "daily",   "unit": "USD/barrel"},
    {"id": "USEPUINDXD",  "name": "Econ Policy Uncertainty",     "frequency": "daily",   "unit": "index"},
]

TTL_BY_FREQUENCY = {
    "daily":   settings.TTL_DAILY,
    "weekly":  settings.TTL_WEEKLY,
    "monthly": settings.TTL_MONTHLY,
}


def _build_fred() -> fredapi.Fred:
    if not settings.FRED_API_KEY:
        raise ValueError("FRED_API_KEY no configurada en .env")
    return fredapi.Fred(api_key=settings.FRED_API_KEY)


def _fetch_series_sync(fred: fredapi.Fred, series_id: str) -> tuple[float, str]:
    """Obtiene el último valor disponible de una serie. Ejecutar en thread."""
    data: pd.Series = fred.get_series(series_id, observation_start="2020-01-01")
    data = data.dropna()
    if data.empty:
        raise ValueError(f"Serie {series_id} sin datos")
    last_date = data.index[-1]
    last_value = float(data.iloc[-1])
    if isinstance(last_date, (date, datetime)):
        date_str = last_date.strftime("%Y-%m-%d")
    else:
        date_str = str(last_date)[:10]
    return last_value, date_str


async def get_indicator(series_id: str) -> MacroIndicator:
    """Obtiene un indicador individual de FRED (async-safe)."""
    meta = next((s for s in SERIES_CATALOG if s["id"] == series_id), None)
    if meta is None:
        raise ValueError(f"Serie {series_id} no está en el catálogo")

    fred = _build_fred()
    value, date_str = await asyncio.to_thread(_fetch_series_sync, fred, series_id)
    logger.debug(f"FRED {series_id}: {value} @ {date_str}")

    return MacroIndicator(
        series_id=series_id,
        name=meta["name"],
        value=value,
        date=date_str,
        frequency=meta["frequency"],
        unit=meta["unit"],
    )


async def get_macro_snapshot(series_ids: list[str] | None = None) -> MacroSnapshot:
    """
    Obtiene todos los indicadores macro (o un subconjunto) en paralelo.

    Args:
        series_ids: lista de IDs a consultar. None = todos los del catálogo.
    """
    catalog = SERIES_CATALOG if series_ids is None else [
        s for s in SERIES_CATALOG if s["id"] in series_ids
    ]
    if not catalog:
        raise ValueError("Ninguna serie válida seleccionada")

    logger.info(f"Fetching {len(catalog)} FRED series...")
    tasks = [get_indicator(s["id"]) for s in catalog]
    indicators = await asyncio.gather(*tasks, return_exceptions=True)

    result: list[MacroIndicator] = []
    for meta, ind in zip(catalog, indicators):
        if isinstance(ind, Exception):
            logger.warning(f"Error fetching {meta['id']}: {ind}")
        else:
            result.append(ind)

    return MacroSnapshot(
        indicators=result,
        fetched_at=datetime.utcnow().isoformat() + "Z",
    )


def snapshot_to_cache_dict(snapshot: MacroSnapshot) -> dict:
    return json.loads(snapshot.model_dump_json())


def snapshot_from_cache_dict(data: dict) -> MacroSnapshot:
    return MacroSnapshot(**data)
