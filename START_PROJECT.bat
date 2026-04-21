@echo off
title Herbalife OS Launcher
echo Starting Herbalife OS Ecosystem...

:: Start the Next.js dev server in a new window
start "Herbalife Server" cmd /c "npm run dev"

echo Waiting for server to initialize...
timeout /t 5 /nobreak > nul

echo Opening UI in browser...
start http://localhost:3000

echo.
echo ==========================================
echo  SYSTEM STATUS: RUNNING
echo  URL: http://localhost:3000
echo ==========================================
echo.
pause
