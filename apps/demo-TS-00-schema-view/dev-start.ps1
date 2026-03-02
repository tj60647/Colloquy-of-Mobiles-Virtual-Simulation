# Clean up any existing dev servers on ports 3000-3002
Write-Host "Checking for existing dev servers..." -ForegroundColor Cyan

$ports = Get-NetTCPConnection -LocalPort 3000,3001,3002 -State Listen -ErrorAction SilentlyContinue

if ($ports) {
    Write-Host "Found existing servers, cleaning up..." -ForegroundColor Yellow
    $ports | ForEach-Object {
        $port = $_.LocalPort
        $procId = $_.OwningProcess
        Write-Host "  Stopping process $procId on port $port" -ForegroundColor Yellow
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Milliseconds 500
    Write-Host "Cleanup complete!" -ForegroundColor Green
} else {
    Write-Host "No existing servers found." -ForegroundColor Green
}

# Start Vite dev server
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
npm run dev:vite
