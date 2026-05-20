@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install Node 18+ and try again.
  pause
  exit /b 1
)

echo Starting Naamin local server at http://127.0.0.1:3000
start "" http://127.0.0.1:3000
node server.js

