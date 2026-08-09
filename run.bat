@echo off
title TunaMagaRecap Studio Launcher
echo ========================================================
echo   🚀 DANG KHOI CHAY TUNAMAGARECAP STUDIO AI...
echo ========================================================
echo.

:: 1. Chay Backend Server (Port 3001) trong cua so moi
echo [1/2] Dang khoi dong Backend Server (Port 3001)...
start "TunaRecap Backend Server (Port 3001)" cmd /k "node server/src/index.js"

:: 2. Tu dong mo trinh duyet sau 3 giay
start /b cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"

:: 3. Chay Frontend Vite (Port 5173)
echo [2/2] Dang khoi dong Frontend Vite (Port 5173)...
echo.
echo -> Dang tu dong mo trinh duyet: http://localhost:5173
echo ========================================================
npm run dev
