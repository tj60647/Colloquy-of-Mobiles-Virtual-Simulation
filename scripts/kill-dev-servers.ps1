# Kill all node processes listening on common dev server ports
Write-Host "Cleaning up all dev servers..." -ForegroundColor Cyan

$portsToCheck = 3000..3010
$connections = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | 
    Where-Object { $portsToCheck -contains $_.LocalPort -and (Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue).Name -eq 'node' }

if ($connections) {
    Write-Host "Found $($connections.Count) dev server(s):" -ForegroundColor Yellow
    $connections | ForEach-Object {
        $port = $_.LocalPort
        $procId = $_.OwningProcess
        Write-Host "  Port $port (PID $procId)" -ForegroundColor Yellow
    }
    
    $uniquePids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    $uniquePids | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "All dev servers stopped!" -ForegroundColor Green
} else {
    Write-Host "No dev servers found." -ForegroundColor Green
}
