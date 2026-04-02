# Aura Terminal — Institutional Quant Trading System

> Buenos Aires Hackathon 2026 | Kaszek × Anthropic × Digital House
> Track: Fintech Infrastructure

Sistema de Trading Algorítmico Cuantitativo de nivel institucional con arquitectura modular de 4 capas. Claude agents actúan como *smart glue* que orquesta señales, datos y ejecución. Basado en la [Guía de Recursos Quant](docs/mvp_v0_aura_terminal.md) del equipo I+D de Aura Investments.

---

## Arquitectura (4 Capas)

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 4 — Visualización    (Grafana + OpenBB Workspace) │
├─────────────────────────────────────────────────────────┤
│  CAPA 3 — AI Agents        (Claude Orchestrator)        │
├─────────────────────────────────────────────────────────┤
│  CAPA 2 — Motor Ejecución  (nautilus_trader)            │
├─────────────────────────────────────────────────────────┤
│  CAPA 1 — Datos            (OpenBB Hub + CCXT/Alpaca)   │
└─────────────────────────────────────────────────────────┘
          ↕ Redis (Event Bus + Cache) ↕
```

---

## Estructura de Carpetas

```
aura_terminal/
├── data_pipeline/          ← CAPA 1: ingesta
│   ├── openbb_hub.py       openbb como hub central de datos (localhost:6900)
│   ├── websockets/         finnhub_ws.py, binance_ws.py
│   ├── rest/               fred_client.py, alpaca_client.py, polling.py
│   └── connectors/         ccxt_adapter.py
│
├── engine/                 ← CAPA 2: motor (nautilus_trader)
│   ├── strategies/         base_strategy.py, sma_crossover.py, momentum.py
│   ├── backtesting/        backtest_runner.py
│   └── execution/          live_runner.py
│
├── ai_agents/              ← CAPA 3: IA
│   ├── agents/             fundamentals_agent.py, news_agent.py,
│   │                       macro_agent.py, orchestrator.py
│   ├── signals/            signal_schema.py, signal_router.py
│   └── prompts/            system_prompts.py
│
├── monitoring/             ← CAPA 4: observabilidad
│   ├── metrics/            prometheus_exporter.py, system_metrics.py
│   └── dashboards/         grafana_provisioning.py
│
├── core/                   config, logger, models, exceptions, redis_client
├── api/                    FastAPI (health, signal endpoints)
└── main.py                 entry point
```

---

## Ramas del Equipo

| Rama | Directorio principal | Responsabilidad |
|---|---|---|
| `feature/data-pipeline` | `aura_terminal/data_pipeline/` | WebSockets, REST polling, OpenBB hub |
| `feature/backtest-core` | `aura_terminal/engine/` | nautilus_trader strategies + backtesting |
| `feature/ai-agents` | `aura_terminal/ai_agents/` | Claude agents, señales JSON |
| `feature/monitoring` | `aura_terminal/monitoring/` + `config/` | Grafana, Prometheus, métricas |

Shared: `aura_terminal/core/` y `aura_terminal/api/` se tocan con PR aprobado.

---

## Quick Start

### 1. Scaffold del proyecto

```bash
chmod +x setup.sh
./setup.sh
```

### 2. Variables de entorno

```bash
cp .env.example .env
# Completar API keys en .env
```

### 3. Levantar servicios (Docker)

```bash
docker compose up -d
```

| Servicio | URL |
|---|---|
| App (FastAPI) | http://localhost:8000 |
| OpenBB ODP | http://localhost:6900 |
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Redis | localhost:6379 |

### 4. Dev mode (sin Docker)

```bash
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
python -m aura_terminal.main
```

### 5. OpenBB como hub de datos

```bash
# Levantar el servidor OpenBB ODP
openbb --serve  # expone FastAPI en localhost:6900

# Desde Python
from openbb import obb
df = obb.equity.price.historical('AAPL', start_date='2024-01-01')
```

### 6. Tests

```bash
pytest tests/ -v
```

---

## Convenciones de Contribución

1. **Nunca pushear a `main` directo.** Todo via PR.
2. **Cada rama toca solo su directorio.** Si necesitás cambiar `aura_terminal/core/`, avisá al equipo.
3. **Schemas compartidos** (`event_types.py`, `signal_schema.py`) se definen primero y se freezean antes de codear.
4. **`.env` nunca se commitea.** Solo `.env.example`.
5. **Formato:** `ruff check . && ruff format .` antes de cada PR.
6. **Tests:** cada módulo nuevo incluye al menos un test en `tests/<módulo>/`.

---

## Stack

| Componente | Tecnología |
|---|---|
| Lenguaje | Python 3.11+ |
| AI | Claude (Anthropic API) |
| Hub de datos | OpenBB Platform 4.x |
| Data feeds | Alpaca (stocks US), Finnhub WS, Binance (CCXT), FRED |
| Motor de ejecución | nautilus_trader (Python/Rust) |
| Event bus / Cache | Redis Pub/Sub |
| API interna | FastAPI + Uvicorn |
| Métricas | Prometheus + Grafana |
| Análisis técnico | pandas-ta |
| Performance analytics | pyfolio-reloaded + quantstats |
| Logging | Loguru |
| Contenedores | Docker Compose |

---

## Guía de Implementación (4 Semanas)

| Semana | Objetivo |
|---|---|
| 1 | Data Pipeline — OpenBB + CCXT + Alpaca + Finnhub conectados y verificados |
| 2 | Backtesting Engine — primera estrategia SMA Crossover con nautilus_trader |
| 3 | ML Signals — features + XGBoost baseline, integrado al backtester |
| 4 | Dashboard & Live — Grafana + paper trading en Alpaca |

---

*Aura Terminal — Built for speed. Designed for scale.*
*Aura Investments · Departamento de Investigación y Desarrollo · 2026*
