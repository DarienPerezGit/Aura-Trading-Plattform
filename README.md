# FENIX — Institutional Quant Trading System

> Buenos Aires Hackathon 2026 | Kaszek × Anthropic × Digital House  
> Track: Fintech Infrastructure

Sistema Quant de Trading Algorítmico de nivel institucional con arquitectura modular de 4 capas. Claude agents actúan como *smart glue* que orquesta señales, datos y ejecución.

---

## Arquitectura (4 Capas)

```
┌─────────────────────────────────────────────────────┐
│  CAPA 4 — Visualización       (Grafana + Prometheus)│
├─────────────────────────────────────────────────────┤
│  CAPA 3 — AI Agents           (Claude → Señales)    │W
├─────────────────────────────────────────────────────┤
│  CAPA 2 — Motor de Ejecución  (Event‑driven engine) │
├─────────────────────────────────────────────────────┤
│  CAPA 1 — Ingesta de Datos    (WS + REST + FRED)    │
└─────────────────────────────────────────────────────┘
        ↕ Redis (Event Bus + Cache) ↕
```

---

## Estructura de Carpetas

```
fenix/
├── data_pipeline/          ← CAPA 1: ingesta
│   ├── websockets/         finnhub_ws.py, binance_ws.py
│   ├── rest/               fred_client.py, polling.py
│   └── connectors/         ccxt_adapter.py
│
├── engine/                 ← CAPA 2: motor
│   ├── events/             event_bus.py, event_types.py
│   ├── execution/          order_manager.py, portfolio.py
│   ├── backtesting/        runner.py, data_loader.py
│   └── strategies/         base_strategy.py, momentum.py
│
├── ai_agents/              ← CAPA 3: IA
│   ├── agents/             fundamentals, news, macro, orchestrator
│   ├── signals/            signal_schema.py, signal_router.py
│   └── prompts/            system_prompts.py
│
├── monitoring/             ← CAPA 4: observabilidad
│   ├── metrics/            prometheus_exporter.py
│   └── dashboards/         grafana_provisioning.py
│
├── core/                   config, logger, models, redis_client
├── api/                    FastAPI (health, polling endpoints)
└── main.py                 entry point
```

---

## Ramas del Equipo

| Rama | Directorio principal | Responsabilidad |
|---|---|---|
| `feature/data-pipeline` | `fenix/data_pipeline/` | WebSockets, REST polling, conectores |
| `feature/backtest-core` | `fenix/engine/` | Motor de eventos, backtesting, estrategias |
| `feature/ai-agents` | `fenix/ai_agents/` | Claude agents, señales JSON |
| `feature/monitoring` | `fenix/monitoring/` + `config/` | Grafana, Prometheus, métricas |

Shared: `fenix/core/` y `fenix/api/` se tocan con PR aprobado.

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
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Redis | localhost:6379 |

### 4. Dev mode (sin Docker)

```bash
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
python -m fenix.main
```

### 5. Tests

```bash
pytest tests/ -v
```

---

## Convenciones de Contribución

1. **Nunca pushear a `main` directo.** Todo via PR.
2. **Cada rama toca solo su directorio.** Si necesitás cambiar `fenix/core/`, avisá al equipo.
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
| Data feeds | Finnhub WS, Binance (CCXT), FRED |
| Event bus | Redis Pub/Sub |
| API | FastAPI + Uvicorn |
| Métricas | Prometheus + Grafana |
| Logging | Loguru |
| Contenedores | Docker Compose |

---

*FENIX — Built for speed. Designed for scale.*
