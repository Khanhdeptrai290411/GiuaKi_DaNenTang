# View last 100 lines of Laravel log
Write-Host "=== LARAVEL LOG (Last 100 lines) ===" -ForegroundColor Green
Write-Host ""
Get-Content "storage\logs\laravel.log" -Tail 100 | Write-Host
Write-Host ""
Write-Host "=== END OF LOG ===" -ForegroundColor Green
Read-Host "Press Enter to exit"

