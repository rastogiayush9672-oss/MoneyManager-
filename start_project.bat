@echo off
title Money Manager Launcher
echo ===================================================
echo       Starting Money Manager (MERN Project)
echo ===================================================

set "PROJECT_DIR=%~dp0"

echo [1/3] Starting Backend Server on port 5000...
start "MoneyManager - Backend (Port 5000)" cmd /k "cd /d ""%PROJECT_DIR%backend"" && node server.js"

echo [2/3] Starting Frontend Vite Server on port 5173...
start "MoneyManager - Frontend (Port 5173)" cmd /k "cd /d ""%PROJECT_DIR%frontend"" && npm run dev"

echo [3/3] Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ===================================================
echo Project started successfully!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo ===================================================
pause
