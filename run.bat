@echo off
setlocal
title TunaMagaRecap Studio AI Launcher
echo ========================================================
echo   🚀 DANG KHOI CHAY TUNAMAGARECAP STUDIO AI...
echo ========================================================
echo.

:: 1. Don dep va giai phong Port 3001 va 5173 neu co tien trinh cu
echo [*] Kiem tra va giai phong Port 3001 va 5173 neu dang bi chiem...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    if not "%%p"=="" if not "%%p"=="0" taskkill /F /PID %%p >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    if not "%%p"=="" if not "%%p"=="0" taskkill /F /PID %%p >nul 2>&1
)

:: 2. Chay Backend Server (Port 3001) trong cua so rieng
echo [1/2] Dang khoi dong Backend Server (Port 3001)...
start "TunaRecap Backend Server (Port 3001)" cmd /k "node server/src/index.js"

:: 3. Cho Backend khoi dong 2 giay roi tu dong mo trinh duyet
start /b cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5173"

:: 4. Chay Frontend Vite (Port 5173)
echo [2/2] Dang khoi dong Frontend Vite (Port 5173)...
echo.
echo -> Dang tu dong mo trinh duyet: http://localhost:5173
echo ========================================================
npm run dev
