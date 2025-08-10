#!/bin/bash

# 🚀 ENTWICKLUNGS-SERVER MIT DYNAMISCHEM PORT
# Verwendung: ./scripts/start-dev.sh [PORT]

# Standard-Port
DEFAULT_PORT=3000

# Port aus Argument oder Umgebungsvariable oder Standard
PORT=${1:-${PORT:-$DEFAULT_PORT}}

echo "🚀 Starte Entwicklungsserver auf Port $PORT..."

# Setze Umgebungsvariablen
export PORT=$PORT
export NEXT_PUBLIC_APP_URL="http://localhost:$PORT"

# Starte den Entwicklungsserver
pnpm dev -p $PORT
