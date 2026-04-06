#!/usr/bin/env bash
# Aura Terminal — Start frontend (Vite dev server)
set -e

cd "$(dirname "$0")/frontend"

echo "Starting Aura Terminal frontend on http://localhost:5173 ..."
echo ""

npm run dev
