#!/usr/bin/env bash
# PassGen Pro — convenience launcher for Linux/macOS.
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "→ Creating virtual environment (.venv)"
  python3 -m venv .venv
fi

# shellcheck source=/dev/null
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo "→ Starting PassGen Pro on http://127.0.0.1:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
