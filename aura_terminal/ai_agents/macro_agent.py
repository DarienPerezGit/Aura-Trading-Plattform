"""
Macro Agent — Capa 3
Consume MacroSnapshot de FRED y genera señal RISK_ON / RISK_OFF via Claude Haiku.
"""

import json

import anthropic

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import MacroSignal, MacroSnapshot
from aura_terminal.data_pipeline.fred_client import get_macro_snapshot

SYSTEM_PROMPT = """Eres un analista macro cuantitativo institucional.
Recibirás indicadores económicos de la Fed Reserve (FRED) y deberás generar
una señal de régimen macro para portfolios de trading.

Reglas:
- RISK_ON: condiciones favorables para activos de riesgo (equities, crypto, EM)
- RISK_OFF: condiciones adversas, preferir cash, treasuries, commodities defensivos

Factores clave que debes analizar:
1. Yield curve (DGS10 - DGS2): negativa → señal recesión → RISK_OFF
2. Fed Funds Rate: ciclo de alzas agresivo → RISK_OFF; pausa/baja → RISK_ON
3. M2 Money Supply: contracción → RISK_OFF; expansión → RISK_ON
4. PCE Core vs target 2%: muy por encima → Fed hawkish → RISK_OFF
5. Economic Policy Uncertainty: spike → RISK_OFF
6. Initial Claims: aumento sostenido → deterioro laboral → RISK_OFF
7. WTI Oil: spike violento → presión inflacionaria → RISK_OFF

Responde ÚNICAMENTE con JSON válido, sin markdown, sin texto extra:
{
  "signal": "RISK_ON" | "RISK_OFF",
  "confidence": <float 0.0-1.0>,
  "reasoning": "<análisis conciso en español, máx 3 oraciones>",
  "key_factors": ["<factor 1>", "<factor 2>", "<factor 3>"]
}"""


def _build_user_message(snapshot: MacroSnapshot) -> str:
    lines = ["Indicadores macro actuales (último dato disponible):"]
    for ind in snapshot.indicators:
        lines.append(
            f"- {ind.name} ({ind.series_id}): {ind.value:.4f} {ind.unit} @ {ind.date}"
        )

    # Calcular yield curve spread si tenemos ambas series
    dgs10 = next((i for i in snapshot.indicators if i.series_id == "DGS10"), None)
    dgs2 = next((i for i in snapshot.indicators if i.series_id == "DGS2"), None)
    if dgs10 and dgs2:
        spread = dgs10.value - dgs2.value
        lines.append(f"\nYield Curve Spread (10Y-2Y): {spread:.4f}% ({'INVERTIDA ⚠' if spread < 0 else 'normal'})")

    lines.append(f"\nSnapshot generado: {snapshot.fetched_at}")
    return "\n".join(lines)


async def generate_macro_signal(snapshot: MacroSnapshot | None = None) -> MacroSignal:
    """
    Genera señal RISK_ON / RISK_OFF analizando el snapshot macro con Claude Haiku.

    Args:
        snapshot: MacroSnapshot opcional. Si no se provee, se fetcha de FRED.
    """
    if snapshot is None:
        logger.info("macro_agent: fetching fresh FRED snapshot...")
        snapshot = await get_macro_snapshot()

    if not snapshot.indicators:
        raise ValueError("MacroSnapshot vacío — sin datos para analizar")

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    user_message = _build_user_message(snapshot)

    logger.info("macro_agent: calling Claude Haiku...")
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    if not response.content or not hasattr(response.content[0], "text"):
        raise ValueError("Claude devolvió respuesta vacía o sin contenido de texto")
    raw = response.content[0].text.strip()
    logger.debug(f"macro_agent raw response: {raw}")

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Claude no devolvió JSON válido: {e}\nRespuesta: {raw}")

    signal = MacroSignal(
        signal=data["signal"],
        confidence=float(data["confidence"]),
        reasoning=data["reasoning"],
        key_factors=data.get("key_factors", []),
        snapshot_date=snapshot.fetched_at,
    )
    logger.info(f"macro_agent signal: {signal.signal} (confidence={signal.confidence:.2f})")
    return signal
