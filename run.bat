@echo off
REM PassGen Pro — convenience launcher for Windows.
cd /d %~dp0

if not exist ".venv\Scripts\activate.bat" (
  echo Creating virtual environment (.venv)
  py -m venv .venv
)

call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo Starting PassGen Pro on http://127.0.0.1:8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
