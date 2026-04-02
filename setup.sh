#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Aura Terminal — Quant Trading System | Project Scaffolding
# Aura Investments I+D · 2026
# Idempotent: safe to run multiple times
# ============================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 Aura Terminal — Setting up project structure..."

# ------------------------------------------------------------
# Helper: create dir + __init__.py
# ------------------------------------------------------------
mk_pkg() {
  mkdir -p "$1"
  touch "$1/__init__.py"
}

# ============================================================
# CAPA 1 — Ingesta de Datos  (feature/data-pipeline)
# ============================================================
mk_pkg "aura_terminal/data_pipeline"
mk_pkg "aura_terminal/data_pipeline/websockets"
mk_pkg "aura_terminal/data_pipeline/rest"
mk_pkg "aura_terminal/data_pipeline/connectors"

# OpenBB como hub central de datos (normaliza múltiples fuentes → localhost:6900)
touch aura_terminal/data_pipeline/openbb_hub.py

touch aura_terminal/data_pipeline/websockets/finnhub_ws.py
touch aura_terminal/data_pipeline/websockets/binance_ws.py
touch aura_terminal/data_pipeline/rest/fred_client.py
touch aura_terminal/data_pipeline/rest/alpaca_client.py
touch aura_terminal/data_pipeline/rest/polling.py
touch aura_terminal/data_pipeline/connectors/ccxt_adapter.py

# ============================================================
# CAPA 2 — Motor de Ejecución  (feature/backtest-core)
# nautilus_trader: backtesting + live trading, core en Rust
# ============================================================
mk_pkg "aura_terminal/engine"
mk_pkg "aura_terminal/engine/strategies"
mk_pkg "aura_terminal/engine/backtesting"
mk_pkg "aura_terminal/engine/execution"

touch aura_terminal/engine/strategies/base_strategy.py
touch aura_terminal/engine/strategies/sma_crossover.py
touch aura_terminal/engine/strategies/momentum.py
touch aura_terminal/engine/backtesting/backtest_runner.py
touch aura_terminal/engine/execution/live_runner.py

# ============================================================
# CAPA 3 — IA & Machine Learning  (feature/ai-agents)
# Claude agents: fundamentals, news, macro, orchestrator
# ============================================================
mk_pkg "aura_terminal/ai_agents"
mk_pkg "aura_terminal/ai_agents/agents"
mk_pkg "aura_terminal/ai_agents/signals"
mk_pkg "aura_terminal/ai_agents/prompts"

touch aura_terminal/ai_agents/agents/fundamentals_agent.py
touch aura_terminal/ai_agents/agents/news_agent.py
touch aura_terminal/ai_agents/agents/macro_agent.py
touch aura_terminal/ai_agents/agents/orchestrator.py
touch aura_terminal/ai_agents/signals/signal_schema.py
touch aura_terminal/ai_agents/signals/signal_router.py
touch aura_terminal/ai_agents/prompts/system_prompts.py

# ============================================================
# CAPA 4 — Visualización & Monitoreo  (feature/monitoring)
# Grafana + Prometheus + OpenBB Workspace
# ============================================================
mk_pkg "aura_terminal/monitoring"
mk_pkg "aura_terminal/monitoring/metrics"
mk_pkg "aura_terminal/monitoring/dashboards"

touch aura_terminal/monitoring/metrics/prometheus_exporter.py
touch aura_terminal/monitoring/metrics/system_metrics.py
touch aura_terminal/monitoring/dashboards/grafana_provisioning.py

# ============================================================
# Shared / Core
# ============================================================
mk_pkg "aura_terminal/core"
touch aura_terminal/core/config.py
touch aura_terminal/core/logger.py
touch aura_terminal/core/models.py
touch aura_terminal/core/exceptions.py
touch aura_terminal/core/redis_client.py

# ============================================================
# API (FastAPI layer: health, signal endpoints)
# ============================================================
mk_pkg "aura_terminal/api"
touch aura_terminal/api/app.py
touch aura_terminal/api/routes.py

# ============================================================
# Tests (mirror source structure)
# ============================================================
mk_pkg "tests"
mk_pkg "tests/data_pipeline"
mk_pkg "tests/engine"
mk_pkg "tests/ai_agents"
mk_pkg "tests/monitoring"
mk_pkg "tests/api"
touch tests/conftest.py

# ============================================================
# Scripts, docs, config
# ============================================================
mkdir -p scripts
mkdir -p docs
mkdir -p config/grafana/provisioning/dashboards
mkdir -p config/grafana/provisioning/datasources
mkdir -p config/prometheus
mkdir -p config/openbb

# Grafana datasource provisioning
cat > config/grafana/provisioning/datasources/prometheus.yml << 'DATASOURCE'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
DATASOURCE

# Prometheus config
cat > config/prometheus/prometheus.yml << 'PROMCFG'
global:
  scrape_interval: 10s
  evaluation_interval: 10s

scrape_configs:
  - job_name: "aura_terminal"
    static_configs:
      - targets: ["app:8000"]
PROMCFG

# OpenBB config placeholder
cat > config/openbb/openbb_config.json << 'OBBCFG'
{
  "providers": {
    "alpaca": {
      "api_key": "${ALPACA_API_KEY}",
      "secret_key": "${ALPACA_SECRET_KEY}"
    },
    "finnhub": {
      "api_key": "${FINNHUB_API_KEY}"
    }
  }
}
OBBCFG

# ============================================================
# Root-level files
# ============================================================
touch aura_terminal/__init__.py
touch aura_terminal/main.py

# .env.example
cat > .env.example << 'ENVFILE'
# === Aura Terminal — Environment Variables ===

# --- Data APIs ---
FINNHUB_API_KEY=your_finnhub_key        # gratis: finnhub.io
FRED_API_KEY=your_fred_key              # gratis: fred.stlouisfed.org
ANTHROPIC_API_KEY=your_anthropic_key   # platform.anthropic.com

# --- Alpaca (stocks US + paper trading) ---
ALPACA_API_KEY=your_alpaca_key          # gratis: alpaca.markets
ALPACA_SECRET_KEY=your_alpaca_secret
ALPACA_BASE_URL=https://paper-api.alpaca.markets

# --- Binance (crypto, datos públicos) ---
BINANCE_API_KEY=your_binance_key        # opcional para datos públicos
BINANCE_SECRET=your_binance_secret

# --- Redis ---
REDIS_URL=redis://redis:6379/0

# --- App ---
LOG_LEVEL=DEBUG
ENVIRONMENT=development
POLLING_INTERVAL_SEC=10

# --- Prometheus / Grafana ---
PROMETHEUS_PORT=9090
GF_SECURITY_ADMIN_PASSWORD=aura2026
ENVFILE

# .gitignore
cat > .gitignore << 'GITIGNORE'
__pycache__/
*.pyc
*.pyo
.env
.venv/
venv/
dist/
build/
*.egg-info/
.mypy_cache/
.pytest_cache/
.coverage
htmlcov/
*.log
data/
*.parquet
GITIGNORE

# pyproject.toml
cat > pyproject.toml << 'PYPROJECT'
[project]
name = "aura-terminal"
version = "0.1.0"
description = "Institutional Quant Trading System — Aura Investments I+D"
requires-python = ">=3.11"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"

[tool.ruff]
line-length = 100
target-version = "py311"
PYPROJECT

# Dockerfile
cat > Dockerfile << 'DOCKERFILE'
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libffi-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "-m", "aura_terminal.main"]
DOCKERFILE

# ============================================================
# Permissions
# ============================================================
chmod +x setup.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ Aura Terminal project structure created successfully."
echo ""
echo "Next steps:"
echo "  1. cp .env.example .env   (and fill your API keys)"
echo "  2. docker compose up -d"
echo "  3. openbb --serve         (levanta hub de datos en localhost:6900)"
echo "  4. python -m aura_terminal.main"
echo ""
