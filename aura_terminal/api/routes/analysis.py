"""
Analysis routes — Capa 3
GET  /analysis/macro/signal  → MacroSignal (RISK_ON / RISK_OFF via Claude)
POST /analysis/chat          → Respuesta conversacional del copiloto AI
"""

import json

from fastapi import APIRouter, HTTPException

from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger
from aura_terminal.core.models import MacroSignal, ChatRequest, ChatResponse
from aura_terminal.core.redis_client import get_redis
from aura_terminal.ai_agents.macro_agent import generate_macro_signal
from aura_terminal.ai_agents.chat_agent import chat_with_market

router = APIRouter(prefix="/analysis", tags=["analysis"])

CACHE_KEY_SIGNAL = "analysis:macro:signal"
TTL_SIGNAL = 6 * 3600  # 6h — señal macro no cambia con alta frecuencia


@router.get("/macro/signal", response_model=MacroSignal)
async def macro_signal():
    """
    Genera una señal macro RISK_ON / RISK_OFF usando Claude Haiku.
    Consume el snapshot FRED fresco y lo analiza con IA.
    """
    redis = None
    try:
        redis = await get_redis()
        cached = await redis.get(CACHE_KEY_SIGNAL)
        if cached:
            logger.debug("Cache hit → macro signal")
            return MacroSignal(**json.loads(cached))
    except Exception as e:
        logger.warning(f"Redis unavailable, skipping cache: {e}")

    logger.info("Generating macro signal via Claude...")
    try:
        signal = await generate_macro_signal()
    except Exception as e:
        logger.error(f"Macro signal generation failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI signal error: {e}")

    if redis is not None:
        try:
            await redis.setex(CACHE_KEY_SIGNAL, TTL_SIGNAL, signal.model_dump_json())
        except Exception as e:
            logger.warning(f"Redis write failed: {e}")
    return signal


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Copiloto AI conversacional con contexto de mercado en tiempo real.
    Usa Claude Haiku con macro snapshot (FRED), señal de régimen y noticias (Finnhub).
    """
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    if not request.message.strip():
        raise HTTPException(status_code=400, detail="message cannot be empty")

    try:
        response_text = await chat_with_market(
            message=request.message,
            history=request.history,
        )
    except Exception as e:
        logger.error(f"Chat agent failed: {e}")
        raise HTTPException(status_code=502, detail=f"AI chat error: {e}")

    return ChatResponse(response=response_text)
