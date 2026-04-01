#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# FENIX — Quant Trading System | Project Scaffolding
# Idempotent: safe to run multiple times
# ============================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

echo "🔧 FENIX — Setting up project structure..."

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
mk_pkg "fenix/data_pipeline"
mk_pkg "fenix/data_pipeline/websockets"
mk_pkg "fenix/data_pipeline/rest"
mk_pkg "fenix/data_pipeline/connectors"

touch fenix/data_pipeline/websockets/finnhub_ws.py
touch fenix/data_pipeline/websockets/binance_ws.py
touch fenix/data_pipeline/rest/fred_client.py
touch fenix/data_pipeline/rest/polling.py
touch fenix/data_pipeline/connectors/ccxt_adapter.py

# ============================================================
# CAPA 2 — Motor de Ejecución  (feature/backtest-core)
# ============================================================
mk_pkg "fenix/engine"
mk_pkg "fenix/engine/events"
mk_pkg "fenix/engine/execution"
mk_pkg "fenix/engine/backtesting"
mk_pkg "fenix/engine/strategies"

touch fenix/engine/events/event_bus.py
touch fenix/engine/events/event_types.py
touch fenix/engine/execution/order_manager.py
touch fenix/engine/execution/portfolio.py
touch fenix/engine/backtesting/runner.py
touch fenix/engine/backtesting/data_loader.py
touch fenix/engine/strategies/base_strategy.py
touch fenix/engine/strategies/momentum.py

# ============================================================
# CAPA 3 — IA & Machine Learning  (feature/ai-agents)
# ============================================================
mk_pkg "fenix/ai_agents"
mk_pkg "fenix/ai_agents/agents"
mk_pkg "fenix/ai_agents/signals"
mk_pkg "fenix/ai_agents/prompts"

touch fenix/ai_agents/agents/fundamentals_agent.py
touch fenix/ai_agents/agents/news_agent.py
touch fenix/ai_agents/agents/macro_agent.py
touch fenix/ai_agents/agents/orchestrator.py
touch fenix/ai_agents/signals/signal_schema.py
touch fenix/ai_agents/signals/signal_router.py
touch fenix/ai_agents/prompts/system_prompts.py

# ============================================================
# CAPA 4 — Visualización & Monitoreo  (feature/monitoring)
# ============================================================
mk_pkg "fenix/monitoring"
mk_pkg "fenix/monitoring/metrics"
mk_pkg "fenix/monitoring/dashboards"

touch fenix/monitoring/metrics/prometheus_exporter.py
touch fenix/monitoring/metrics/system_metrics.py
touch fenix/monitoring/dashboards/grafana_provisioning.py

# ============================================================
# Shared / Core
# ============================================================
mk_pkg "fenix/core"
touch fenix/core/config.py
touch fenix/core/logger.py
touch fenix/core/models.py
touch fenix/core/exceptions.py
touch fenix/core/redis_client.py

# ============================================================
# API (optional FastAPI layer for polling / health)
# ============================================================
mk_pkg "fenix/api"
touch fenix/api/app.py
touch fenix/api/routes.py

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
  - job_name: "fenix"
    static_configs:
      - targets: ["app:8000"]
PROMCFG

# ============================================================
# Root‑level files
# ============================================================
touch fenix/__init__.py
touch fenix/main.py

# .env.example
cat > .env.example << 'ENVFILE'
# === API Keys ===
FINNHUB_API_KEY=your_finnhub_key
ANTHROPIC_API_KEY=your_anthropic_key
FRED_API_KEY=your_fred_key

# === Binance (paper / testnet) ===
BINANCE_API_KEY=your_binance_key
BINANCE_SECRET=your_binance_secret

# === Redis ===
REDIS_URL=redis://redis:6379/0

# === App ===
LOG_LEVEL=DEBUG
ENVIRONMENT=development
POLLING_INTERVAL_SEC=10

# === Prometheus ===
PROMETHEUS_PORT=9090

# === Grafana ===
GF_SECURITY_ADMIN_PASSWORD=fenix2026
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
GITIGNORE

# pyproject.toml (minimal)
cat > pyproject.toml << 'PYPROJECT'
[project]
name = "fenix"
version = "0.1.0"
requires-python = ">=3.11"

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
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

CMD ["python", "-m", "fenix.main"]
DOCKERFILE

# ============================================================
# Permissions
# ============================================================
chmod +x setup.sh 2>/dev/null || true
chmod +x scripts/*.sh 2>/dev/null || true

echo ""
echo "✅ FENIX project structure created successfully."
echo ""
echo "Next steps:"
echo "  1. cp .env.example .env   (and fill your keys)"
echo "  2. docker compose up -d"
echo "  3. python -m fenix.main"
echo ""
