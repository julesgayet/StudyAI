#!/usr/bin/env bash
# Convenience launcher for the StudyAI frontend during local development.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f ".env.local" ]; then
    echo "🧪 Fichier .env.local manquant. Création depuis env.local.example."
    cp env.local.example .env.local
fi

if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances frontend..."
    npm install
fi

echo "🚀 Lancement du frontend StudyAI sur http://localhost:${PORT:-3000}"
exec npm run dev
