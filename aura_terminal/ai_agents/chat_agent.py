"""
Chat Agent — Capa 3
Copiloto de trading conversacional usando Claude con contexto de mercado en tiempo real.
"""

import asyncio

import anthropic

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import ChatMessage
from aura_terminal.data_pipeline.fred_client import get_macro_snapshot
from aura_terminal.data_pipeline.finnhub_client import get_market_news
from aura_terminal.ai_agents.macro_agent import generate_macro_signal

SYSTEM_PROMPT = """Eres AURA AI, el copiloto de trading institucional de la Aura Terminal.
Eres un analista senior con expertise en:
- Análisis técnico y fundamental de acciones, crypto y ETFs
- Macro economía y régimen de mercado (Risk-On / Risk-Off)
- Gestión de riesgo y sizing de posiciones
- Estrategias quant y momentum

Tienes acceso a datos de mercado en tiempo real que se incluyen en el contexto del usuario.

Reglas:
- Responde SIEMPRE en español
- Sé conciso y directo — el trader necesita información accionable
- Usa markdown para formatear: **bold** para datos clave, listas para factores
- Cuando des precios o métricas, usa los datos del contexto si están disponibles
- Nunca inventes datos específicos (precios exactos, fechas) que no estén en el contexto
- Si el contexto no tiene suficiente información para una pregunta específica, dilo y ofrece lo que sí puedes analizar"""


async def _build_market_context() -> str:
    """Construye el contexto de mercado actual para incluir en el prompt."""
    context_parts: list[str] = []

    # Macro snapshot + señal
    try:
        snapshot, signal = await asyncio.gather(
            get_macro_snapshot(),
            generate_macro_signal(),
            return_exceptions=True,
        )

        if not isinstance(signal, Exception):
            context_parts.append(
                f"## Régimen Macro Actual: {signal.signal} "
                f"(confianza: {signal.confidence:.0%})\n"
                f"{signal.reasoning}\n"
                f"Factores clave: {', '.join(signal.key_factors)}"
            )

        if not isinstance(snapshot, Exception) and snapshot.indicators:
            lines = ["## Indicadores FRED (último dato disponible)"]
            for ind in snapshot.indicators:
                lines.append(f"- **{ind.name}** ({ind.series_id}): {ind.value:.4f} {ind.unit} @ {ind.date}")
            context_parts.append("\n".join(lines))
    except Exception as e:
        logger.warning(f"chat_agent: error building macro context: {e}")

    # Últimas noticias
    try:
        news = await get_market_news()
        if news:
            lines = ["## Últimas noticias del mercado"]
            for n in news[:8]:
                syms = ", ".join(s for s in n.symbols if s) or "General"
                lines.append(f"- **{n.headline}** ({n.source}) — Activos: {syms}")
            context_parts.append("\n".join(lines))
    except Exception as e:
        logger.warning(f"chat_agent: error fetching news context: {e}")

    if not context_parts:
        return "## Contexto de mercado\nDatos no disponibles en este momento."

    return "\n\n".join(context_parts)


async def chat_with_market(
    message: str,
    history: list[ChatMessage] | None = None,
) -> str:
    """
    Genera una respuesta conversacional usando Claude con contexto de mercado.

    Args:
        message: Pregunta o consulta del usuario.
        history: Historial de mensajes previos (para conversación continua).
    """
    logger.info(f"chat_agent: processing query: {message[:80]}...")

    context = await _build_market_context()

    user_content = f"""# Contexto de mercado en tiempo real
{context}

---
# Consulta del trader
{message}"""

    # Construir historial de mensajes para Claude
    messages: list[dict] = []
    if history:
        for msg in history[-6:]:  # máximo 6 mensajes de historial
            messages.append({"role": msg.role, "content": msg.content})

    # El mensaje actual del usuario incluye el contexto
    messages.append({"role": "user", "content": user_content})

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    logger.info("chat_agent: calling Claude...")
    response = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
    )

    if not response.content or not hasattr(response.content[0], "text"):
        raise ValueError("Claude devolvió respuesta vacía")

    result = response.content[0].text.strip()
    logger.debug(f"chat_agent: response length={len(result)} chars")
    return result
