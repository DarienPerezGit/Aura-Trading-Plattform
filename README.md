# Aura Terminal — Trading Intelligence Platform

> Buenos Aires Hackathon 2026 | Kaszek x Anthropic x Digital House
> Track: Fintech Infrastructure

Terminal de trading estilo Bloomberg con datos de mercado en tiempo real, analisis macro via IA, y visualizacion profesional. Backend en Python (FastAPI), frontend en React (Vite).

---

## Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│  FRONTEND — React + Vite + Tailwind                      │
│  Terminal UI con 10 vistas (Command Center, Charts, AI)  │
├──────────────────────────────────────────────────────────┤
│  API LAYER — FastAPI (17 endpoints REST)                 │
├──────────────────────────────────────────────────────────┤
│  AI AGENTS — Claude Haiku (senal macro RISK_ON/OFF)      │
├──────────────────────────────────────────────────────────┤
│  DATA PIPELINE — 4 fuentes de datos externas             │
│  Finnhub · Alpaca · CCXT/Binance · FRED                  │
└──────────────────────────────────────────────────────────┘
         ↕ Redis (Cache + TTL por frecuencia) ↕
```

---

## APIs Integradas

| Fuente | Datos | Endpoints | API Key |
|--------|-------|-----------|---------|
| **CCXT / Binance** | Crypto en tiempo real (BTC, ETH, SOL) + OHLCV | `/market/crypto/*` | No necesita |
| **Finnhub** | Noticias de mercado + noticias por empresa | `/market/news`, `/market/news/{sym}` | Free tier |
| **FRED** | Indicadores macro (Fed Funds, Treasury Yields, CPI, etc.) | `/market/macro`, `/market/macro/{id}` | Free tier |
| **Alpaca** | Cotizaciones US stocks + barras OHLCV | `/market/quote/*`, `/market/bars/*` | Free (paper trading) |
| **Anthropic** | Senal AI macro RISK_ON / RISK_OFF via Claude | `/analysis/macro/signal` | Pago |

---

## Endpoints

| Metodo | Ruta | Descripcion | Cache TTL |
|--------|------|-------------|-----------|
| GET | `/health` | Estado del servicio + Redis | — |
| GET | `/market/macro` | Snapshot de todos los indicadores FRED | 4-24h |
| GET | `/market/macro/{id}` | Indicador individual (ej: DGS10) | 4-24h |
| GET | `/market/macro/catalog/list` | Lista de series FRED disponibles | — |
| GET | `/market/news` | Noticias generales (Finnhub) | 120s |
| GET | `/market/news/{symbol}` | Noticias de empresa | 120s |
| GET | `/market/sentiment/{symbol}` | Sentimiento (requiere Finnhub premium) | 300s |
| GET | `/market/quote/{symbol}` | Cotizacion stock (Alpaca) | 5s |
| GET | `/market/quotes?symbols=` | Cotizaciones multiples | 5s |
| GET | `/market/bars/{symbol}` | Barras OHLCV stock | 60s |
| GET | `/market/crypto/ticker/{symbol}` | Ticker crypto en vivo | 5s |
| GET | `/market/crypto/tickers?symbols=` | Tickers crypto multiples | 5s |
| GET | `/market/crypto/ohlcv/{symbol}` | Barras OHLCV crypto | 60s |
| GET | `/analysis/macro/signal` | Senal AI RISK_ON/RISK_OFF (Claude) | 6h |
| GET | `/metrics` | Metricas Prometheus | — |

---

## Estructura del Proyecto

```
aura_terminal/                  ← Backend (Python/FastAPI)
├── main.py                     Entry point + CORS + Prometheus
├── core/
│   ├── config.py               Pydantic Settings (.env)
│   ├── models.py               Modelos compartidos
│   ├── logger.py               Loguru (rotacion diaria)
│   └── redis_client.py         Async Redis singleton
├── data_pipeline/
│   ├── fred_client.py          FRED API (10 series macro)
│   ├── finnhub_client.py       Noticias + quotes
│   ├── alpaca_client.py        US stocks (quotes + bars)
│   └── ccxt_client.py          Crypto via Binance
├── ai_agents/
│   └── macro_agent.py          Claude Haiku → RISK_ON/RISK_OFF
└── api/routes/
    ├── health.py               GET /health
    ├── market.py               Todos los endpoints de mercado
    └── analysis.py             GET /analysis/macro/signal

frontend/                       ← Frontend (React/Vite/Tailwind)
├── src/
│   ├── lib/api.ts              Cliente API (fetch tipado a backend)
│   ├── hooks/use-market-data.ts  Polling real cada 10s + fallback mock
│   ├── stores/                 Zustand (market, ai, alerts, portfolio)
│   ├── pages/                  10 vistas (Command Center, Markets, etc.)
│   ├── components/             Shell + charts + shared UI
│   └── data/                   Mock data (fallback cuando API no disponible)
└── vite.config.ts              Proxy: /api → localhost:8000
```

---

## Quick Start

### 1. Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp example.env .env
# Completar API keys en .env

uvicorn aura_terminal.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

### 3. Acceder

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

---

## Variables de Entorno

```bash
# Finnhub (noticias) — https://finnhub.io/register
FINNHUB_API_KEY=

# Alpaca (stocks) — https://app.alpaca.markets/signup
ALPACA_API_KEY=
ALPACA_SECRET_KEY=
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# FRED (macro) — https://fred.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY=

# Anthropic (AI signal, opcional) — https://console.anthropic.com
ANTHROPIC_API_KEY=

# Redis (opcional, cache)
REDIS_URL=redis://localhost:6379
```

Todas las APIs tienen tier gratuito excepto Anthropic. Crypto (CCXT/Binance) no requiere key.

---

## Stack

| Componente | Tecnologia |
|------------|------------|
| Backend | Python 3.11+ / FastAPI / Uvicorn |
| Frontend | React 19 / Vite / Tailwind / Zustand |
| Charts | Lightweight Charts (TradingView) |
| AI | Claude Haiku (Anthropic API) |
| Data | Finnhub, Alpaca, CCXT, FRED |
| Cache | Redis (async) |
| Observabilidad | Prometheus + Loguru |
| Contenedores | Docker Compose |

---

*Aura Terminal — Built for the Buenos Aires Hackathon 2026.*
