Write-Host "Starting FastAPI server..." -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py"

Start-Sleep -Seconds 3

Write-Host "Opening frontend in browser..." -ForegroundColor Green

$htmlPath = Join-Path $PSScriptRoot "prototype\index.html"

Start-Process $htmlPath

Write-Host "Frontend opened! Make sure the server is running on http://localhost:8000" -ForegroundColor Yellow