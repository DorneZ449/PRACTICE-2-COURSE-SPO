@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
title PassGen Pro · Launcher

REM ── Включаем поддержку ANSI-цветов (Windows 10+) ──────────────────────
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "R=%ESC%[0m"
set "B=%ESC%[1m"
set "D=%ESC%[2m"
set "C=%ESC%[96m"
set "G=%ESC%[92m"
set "Y=%ESC%[93m"
set "RD=%ESC%[91m"
set "M=%ESC%[95m"

cd /d "%~dp0"
cls
echo.
echo  %C%%B%════════════════════════════════════════════════════%R%
echo     %C%%B%🔐  P A S S G E N   P R O%R%
echo     %D%Secure Password Generator · FastAPI + SQLite%R%
echo  %C%%B%════════════════════════════════════════════════════%R%
echo.

echo  %M%[1/4]%R% %B%Проверка виртуального окружения...%R%
if not exist ".venv\Scripts\activate.bat" (
    echo        %Y%- окружение не найдено, создаю .venv%R%
    py -m venv .venv
    if errorlevel 1 (
        echo  %RD%x Не удалось создать .venv. Установлен ли Python?%R%
        pause
        exit /b 1
    )
) else (
    echo        %G%✓ окружение найдено%R%
)

echo  %M%[2/4]%R% %B%Активация окружения...%R%
call .venv\Scripts\activate.bat
echo        %G%✓ активировано%R%

echo  %M%[3/4]%R% %B%Установка зависимостей...%R%
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo  %RD%x Ошибка установки зависимостей. Подробности ниже:%R%
    pip install -r requirements.txt
    pause
    exit /b 1
)
echo        %G%✓ зависимости готовы%R%

echo  %M%[4/4]%R% %B%Запуск сервера...%R%
echo.
echo  %G%%B%  ● PassGen Pro доступен по адресу:%R%
echo       %C%http://127.0.0.1:8000%R%        %D%(UI)%R%
echo       %C%http://127.0.0.1:8000/docs%R%   %D%(Swagger API)%R%
echo.
echo  %D%  Нажмите Ctrl+C, чтобы остановить сервер.%R%
echo.

REM ── Открыть браузер с задержкой, пока сервер поднимается ──────────────
start "" /b cmd /c "timeout /t 3 /nobreak >nul & start "" http://127.0.0.1:8000"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000