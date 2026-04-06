#!/usr/bin/env bash
# Aura Terminal — Start backend (FastAPI + uvicorn)
set -e

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
  echo "ERROR: .env no encontrado. Copiá tu .env al directorio raíz del proyecto."
  exit 1
fi

echo "Starting Aura Terminal backend on http://localhost:8000 ..."
echo "  Docs: http://localhost:8000/docs"
echo ""

.venv/Scripts/python.exe -m uvicorn aura_terminal.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --reload
