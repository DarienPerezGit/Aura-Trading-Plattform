from fastapi import APIRouter
from aura_terminal.core.redis_client import get_redis

router = APIRouter(tags=["health"])


@router.get("/health")
async def health():
    try:
        redis = await get_redis()
        redis_ok = await redis.ping()
        redis_status = "ok" if redis_ok else "error"
    except Exception:
        redis_status = "unavailable"

    return {
        "status": "ok",
        "redis": redis_status,
    }
