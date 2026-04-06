import redis.asyncio as aioredis
from aura_terminal.core.config import settings
from aura_terminal.core.logger import logger

_redis: aioredis.Redis | None = None
_redis_available: bool = True   # se pone False al primer fallo para no reintentar


async def get_redis() -> aioredis.Redis:
    global _redis, _redis_available

    if not _redis_available:
        raise ConnectionError("Redis disabled after previous failure")

    if _redis is None:
        _redis = await aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=0.5,   # falla rápido si no hay Redis
            socket_timeout=0.5,
            retry_on_timeout=False,
        )
        # Verificar que realmente responde
        try:
            await _redis.ping()
            logger.info(f"Redis connected → {settings.REDIS_URL}")
        except Exception as e:
            _redis = None
            _redis_available = False
            logger.warning(f"Redis ping failed, disabling cache: {e}")
            raise

    return _redis


async def close_redis() -> None:
    global _redis, _redis_available
    if _redis:
        await _redis.aclose()
        _redis = None
    _redis_available = True   # reset al reiniciar
    logger.info("Redis connection closed.")
