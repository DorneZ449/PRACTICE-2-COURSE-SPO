@echo off
setlocal EnableExtensions EnableDelayedExpansion
title PassGen Pro - Launcher

REM ===== ANSI colors (Windows 10+) =====
for /f %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"
set "R=%ESC%[0m"
set "B=%ESC%[1m"
set "D=%ESC%[2m"
set "C1=%ESC%[96m"
set "C2=%ESC%[36m"
set "C3=%ESC%[94m"
set "C=%ESC%[96m"
set "G=%ESC%[92m"
set "Y=%ESC%[93m"
set "RD=%ESC%[91m"
set "M=%ESC%[95m"

cd /d "%~dp0"
cls
echo.
echo  %C3%%B%   ####   ###   ####  ####  #### ##### #   #%R%
echo  %C2%%B%   #   # #   # #     #     #     #     ##  #%R%
echo  %C1%%B%   ####  #####  ###   ###  #  ## ####  # # #%R%
echo  %C2%%B%   #     #   #     #     # #   # #     #  ##%R%
echo  %C3%%B%   #     #   # ####  ####   #### ##### #   #%R%
echo.
echo  %M%%B%                              P  R  O%R%
echo  %D%        Secure Password Generator  -  FastAPI + SQLite%R%
echo  %D%        Lead author: Dmitry Sergeevich%R%
echo  %C1%   ==============================================================%R%
echo.

set "VENV_PY=.venv\Scripts\python.exe"

REM ===== [1/4] Locate Python (no admin) =====
echo  %M%[1/4]%R% %B%Looking for Python...%R%
set "PY="
py -3 --version >nul 2>&1 && set "PY=py -3"
if not defined PY ( python --version >nul 2>&1 && set "PY=python" )
if not defined PY ( python3 --version >nul 2>&1 && set "PY=python3" )

if not defined PY (
    echo        %Y%- not found. Trying winget per-user install, no admin...%R%
    where winget >nul 2>&1 && winget install --id Python.Python.3.12 --scope user --silent --accept-package-agreements --accept-source-agreements
    for /d %%d in ("%LOCALAPPDATA%\Programs\Python\Python3*") do if exist "%%d\python.exe" set "PY=%%d\python.exe"
)

if not defined PY (
    echo.
    echo  %RD%x Python is not installed and could not be installed automatically.%R%
    echo     Install it WITHOUT admin rights:
    echo       1^) Microsoft Store: search "Python 3.12" and press Get
    echo       2^) https://www.python.org/downloads/windows/
    echo          tick "Add python.exe to PATH"; leave "for all users" unticked
    echo     Then run this file again.
    echo.
    pause
    exit /b 1
)
set "PYVER="
for /f "delims=" %%v in ('%PY% --version 2^>^&1') do set "PYVER=%%v"
if defined PYVER ( echo        %G%[OK] !PYVER!%R% ) else ( echo        %G%[OK] Python found%R% )

REM ===== [2/4] Virtual environment =====
echo  %M%[2/4]%R% %B%Preparing virtual environment...%R%
set "NEED_VENV=0"
if not exist "%VENV_PY%" set "NEED_VENV=1"
if "!NEED_VENV!"=="0" ( %VENV_PY% -m pip --version >nul 2>&1 || set "NEED_VENV=1" )

if "!NEED_VENV!"=="1" if exist ".venv" (
    echo        %Y%- existing .venv is broken or copied, recreating%R%
    rmdir /s /q ".venv"
)
if "!NEED_VENV!"=="1" %PY% -m venv .venv

set "USERFLAG="
if not exist "%VENV_PY%" (
    echo        %Y%- venv unavailable, using --user install on base Python%R%
    set "VENV_PY=%PY%"
    set "USERFLAG=--user"
)
echo        %G%[OK] environment ready%R%

REM ===== [3/4] Dependencies =====
echo  %M%[3/4]%R% %B%Installing dependencies...%R%
set "DEPS_OK=0"
if exist "requirements.txt" if exist ".venv\.req.lock" fc /b "requirements.txt" ".venv\.req.lock" >nul 2>&1 && set "DEPS_OK=1"

if "!DEPS_OK!"=="1" (
    echo        %G%[OK] dependencies cached, nothing to install%R%
) else (
    %VENV_PY% -m pip --version >nul 2>&1 || %VENV_PY% -m ensurepip --upgrade >nul 2>&1
    %VENV_PY% -m pip install !USERFLAG! --upgrade pip >nul 2>&1
    if exist "requirements.txt" %VENV_PY% -m pip install !USERFLAG! -q -r requirements.txt >nul 2>&1
    if not exist "requirements.txt" %VENV_PY% -m pip install !USERFLAG! -q "fastapi>=0.115.6,<1.0.0" "uvicorn[standard]>=0.34.0,<1.0.0" "jinja2>=3.1.4,<4.0.0" "python-multipart>=0.0.20,<1.0.0" "pydantic>=2.12.0,<3.0.0" >nul 2>&1
    if errorlevel 1 (
        echo  %RD%x Install failed, retrying with full output...%R%
        if exist "requirements.txt" %VENV_PY% -m pip install !USERFLAG! -r requirements.txt
        echo.
        echo  %RD%x Could not install dependencies - see messages above.%R%
        echo     %D%Usually the network or proxy is blocking PyPI. Try a phone hotspot.%R%
        echo.
        pause
        exit /b 1
    )
    if exist ".venv\.req.lock" del /q ".venv\.req.lock" >nul 2>&1
    if exist "requirements.txt" if exist ".venv" copy /y "requirements.txt" ".venv\.req.lock" >nul 2>&1
    echo        %G%[OK] dependencies ready%R%
)

REM ===== [4/4] Start server =====
echo  %M%[4/4]%R% %B%Starting server...%R%
echo.
echo  %G%%B%  PassGen Pro is available at:%R%
echo       %C%http://127.0.0.1:8000%R%        %D%UI%R%
echo       %C%http://127.0.0.1:8000/docs%R%   %D%Swagger API%R%
echo.
echo  %D%  Press Ctrl+C to stop the server.%R%
echo.

start "" /b cmd /c "timeout /t 3 /nobreak >nul & start "" http://127.0.0.1:8000"
%VENV_PY% -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

echo.
echo  %D%Server stopped. Thanks for using PassGen Pro - by Dmitry Sergeevich.%R%
pause >nul
