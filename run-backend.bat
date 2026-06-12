@echo off
setlocal
cd /d "%~dp0backend"

echo Checking for Python...
where python >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERROR: Python is not installed or not on PATH.
    echo Download Python 3.10+ from https://www.python.org/downloads/
    echo During install, CHECK the box "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

python --version
echo.

if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
    if errorlevel 1 (
        echo Failed to create venv.
        pause
        exit /b 1
    )
)

call .venv\Scripts\activate.bat
pip install --upgrade pip > NUL
echo Installing dependencies (first run takes a few minutes)...
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo Dependency install failed. See messages above.
    pause
    exit /b 1
)

echo.
echo Starting API on http://127.0.0.1:8000  (docs at /docs)
echo (Leave this window open. Press Ctrl+C to stop.)
echo.
uvicorn main:app --host 127.0.0.1 --port 8000 --reload

echo.
echo Backend stopped.
pause
endlocal
