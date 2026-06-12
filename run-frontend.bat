@echo off
setlocal
cd /d "%~dp0frontend"

echo Checking for Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed or not on PATH.
    echo Download the LTS installer from https://nodejs.org/ and re-run this script.
    echo.
    pause
    exit /b 1
)

node --version
npm --version
echo.

if not exist node_modules (
    echo Installing npm dependencies (first run takes a minute)...
    call npm install
    if errorlevel 1 (
        echo.
        echo npm install failed. See messages above.
        pause
        exit /b 1
    )
)

echo.
echo Starting frontend on http://127.0.0.1:5173
echo (Leave this window open. Press Ctrl+C to stop.)
echo.
call npm run dev

echo.
echo Frontend stopped.
pause
endlocal
