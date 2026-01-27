@echo off
title Web Version Tester
echo [1/2] Terminating potentially conflicting processes...
taskkill /f /im node.exe /t >nul 2>&1
timeout /t 1 >nul

echo [2/2] Starting Web Test Environment...
start "Web API Server" cmd /k "node web_test_server.js"
timeout /t 2 >nul
start "Web Frontend" cmd /k "npm run dev"

echo.
echo WEB VERSION TEST STARTED!
echo Please use code: WELCOME_LAO
pause
