from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST, Counter, Histogram
from aura_terminal.core.redis_client import get_redis, close_redis
from aura_terminal.core.logger import logger
from aura_terminal.api.routes import health, market, analysis

# Prometheus metrics
REQUEST_COUNT = Counter("aura_requests_total", "Total HTTP requests", ["method", "endpoint", "status"])
REQUEST_LATENCY = Histogram("aura_request_latency_seconds", "Request latency", ["endpoint"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Aura Terminal starting up...")
    await get_redis()
    logger.info("Redis connected.")
    yield
    logger.info("Aura Terminal shutting down...")
    await close_redis()


app = FastAPI(
    title="Aura Terminal API",
    description="Trading dashboard backend — market data, news, AI signals",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # el frontend puede consumir desde cualquier origen
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(market.router)
app.include_router(analysis.router)


@app.get("/metrics")
async def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/")
async def root():
    return {"service": "Aura Terminal API", "version": "0.1.0", "docs": "/docs"}
