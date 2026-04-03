# Aura Terminal — Bloomberg Open Source

> Aura Investments · Departamento I+D · 2026

Terminal de información de mercado tipo Bloomberg, construida sobre herramientas open source. El objetivo: replicar —y superar en flexibilidad— la funcionalidad de un Bloomberg Terminal (~$20,000/año) a costo cercano a cero, con IA integrada para análisis en tiempo real.

---

## Qué es Aura Terminal

Una plataforma que centraliza datos de mercado (precios, noticias, fundamentals, macro) y los presenta al trader con contexto e inteligencia artificial. No es un motor de ejecución — es la capa de información y análisis que precede a cualquier decisión de trading.

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 4 — Visualización     (Grafana + OpenBB Workspace)    │
├─────────────────────────────────────────────────────────────┤
│  CAPA 3 — AI Signals        (Claude Haiku — Anthropic API)  │
├─────────────────────────────────────────────────────────────┤
│  CAPA 2 — Terminal Bloomberg (OpenBB Platform + FastAPI)    │
├─────────────────────────────────────────────────────────────┤
│  CAPA 1 — Datos              (Alpaca · Finnhub · FRED · CCXT)│
└─────────────────────────────────────────────────────────────┘
                  ↕ Redis (Cache + Pub/Sub) ↕
```

---

## Qué hace el sistema

| Módulo | Fuente | Qué ve el trader |
|---|---|---|
| Cotizaciones en tiempo real | Alpaca + Finnhub | Precio, cambio, volumen |
| Histórico OHLCV | Alpaca | Gráfico de velas |
| Crypto multi-exchange | CCXT (Binance, Kraken...) | BTC, ETH y 100+ pares |
| Noticias por símbolo | Finnhub | Headlines con fuente y timestamp |
| Datos macro | FRED (Fed Reserve) | Inflación, tasas, empleo |
| Señal AI — Noticias | Claude Haiku | BUY / SELL / HOLD + reasoning |
| Señal AI — Macro | Claude Haiku | RISK_ON / RISK_OFF + reasoning |
| Señal AI — Orquestada | Claude Haiku | Señal final consolidada con contexto |

---

## Stack

| Componente | Tecnología | Para qué |
|---|---|---|
| Hub de datos | OpenBB Platform 4.x | Normaliza todas las fuentes, expone REST en localhost:6900 |
| Data feeds | Alpaca · Finnhub · CCXT · FRED | Precios, noticias, crypto, macro |
| AI Agents | Claude Haiku (Anthropic) | Análisis de noticias, macro y señales orquestadas |
| API interna | FastAPI + Uvicorn | Backend que consume el hub y expone endpoints al frontend |
| Cache | Redis | TTL por endpoint, evita rate limits de APIs externas |
| Visualización | Grafana + Prometheus | Dashboards de mercado y métricas del sistema |
| Logging | Loguru | Logs estructurados con rotación diaria |
| Contenedores | Docker Compose | Todo el stack levanta con un comando |

---

## Estructura del Proyecto

```
aura_terminal/
├── data_pipeline/          ← CAPA 1: ingesta de datos
│   ├── alpaca_client.py    precios históricos + cotizaciones US
│   ├── finnhub_client.py   noticias + sentimiento + cotizaciones
│   ├── ccxt_client.py      crypto multi-exchange
│   └── fred_client.py      indicadores macro (Fed Reserve)
│
├── ai_agents/              ← CAPA 3: señales con IA
│   ├── news_agent.py       analiza headlines → BUY/SELL/HOLD
│   ├── macro_agent.py      analiza macro → RISK_ON/RISK_OFF
│   └── orchestrator.py     sintetiza ambas señales en una final
│
├── api/                    ← CAPA 2: endpoints REST
│   └── routes/
│       ├── health.py       /health — estado del sistema
│       ├── market.py       /market — precios, barras, crypto, noticias, macro
│       └── analysis.py     /analysis — señales AI por símbolo
│
├── core/                   config, logger, models, redis_client
└── main.py                 entry point FastAPI
```

---

## Quick Start

### 1. Variables de entorno

```bash
cp .env.example .env
# Completar API keys en .env
```

### 2. Levantar el stack completo

```bash
docker compose up --build
```

| Servicio | URL |
|---|---|
| API + Swagger | http://localhost:8000/docs |
| Grafana | http://localhost:3000 (admin / aura2026) |
| Prometheus | http://localhost:9090 |
| Redis | localhost:6379 |

### 3. Dev mode (sin Docker)

```bash
pip install -r requirements.txt
uvicorn aura_terminal.main:app --reload --port 8000
```

---

## API Keys necesarias

Todas tienen free tier suficiente para desarrollo:

| Key | Dónde conseguirla | Costo |
|---|---|---|
| `FINNHUB_API_KEY` | finnhub.io/register | Gratis |
| `ALPACA_API_KEY` + `SECRET` | alpaca.markets | Gratis |
| `FRED_API_KEY` | fred.stlouisfed.org/docs/api/api_key | Gratis |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Pago (AI agents) |

---

## Endpoints principales

```
GET /market/quote/{symbol}          → cotización en tiempo real
GET /market/bars/{symbol}?days=30   → histórico OHLCV
GET /market/crypto/{symbol}         → cotización crypto (BTC-USDT)
GET /market/news/{symbol}           → noticias recientes
GET /market/macro                   → indicadores macro FRED
GET /analysis/signal/{symbol}       → señal AI completa (news + macro)
GET /health                         → estado de la API y Redis
GET /metrics                        → métricas Prometheus
```

---

## Ramas del Equipo

| Rama | Responsabilidad |
|---|---|
| `backend` | API FastAPI, data pipeline, AI agents, infra Docker |
| `feature/frontend` | Dashboard web que consume la API |
| `feature/data-pipeline` | Nuevos conectores de datos |
| `feature/ai-agents` | Nuevos agentes Claude, mejoras de prompts |

Reglas: nunca pushear a `main` directo. Todo via PR. `.env` nunca se commitea.

---

## Roadmap

| Fase | Objetivo |
|---|---|
| 1 — Data Pipeline | Conectar todas las APIs, verificar endpoints con datos reales |
| 2 — AI Signals | Afinar prompts de agentes Claude, agregar análisis técnico (pandas-ta) |
| 3 — Frontend | Dashboard web que consuma la API — cotizaciones, noticias, señales AI |
| 4 — Visualización avanzada | Dashboards Grafana con feeds de precios y métricas de mercado |

---

*Aura Terminal — Terminal Bloomberg open source con IA integrada.*
*Aura Investments · Departamento de Investigación y Desarrollo · 2026*
