Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🚀 DANG KHOI CHAY TUNAMAGARECAP STUDIO AI..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[*] Kiem tra va giai phong Port 3001 & 5173..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 3001,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

Write-Host "[1/2] Dang khoi dong Backend Server (Port 3001)..." -ForegroundColor Cyan
Start-Process "cmd.exe" -ArgumentList "/k node server/src/index.js" -WindowStyle Normal

Start-Sleep -Seconds 2
Start-Process "http://localhost:5173"

Write-Host "[2/2] Dang khoi dong Frontend Vite (Port 5173)..." -ForegroundColor Cyan
Write-Host "-> Da tu dong mo trinh duyet tai http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
npm run dev
