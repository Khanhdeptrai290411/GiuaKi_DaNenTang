@echo off
echo ============================================
echo Checking last 50 lines of Laravel log...
echo ============================================
echo.
powershell -Command "Get-Content storage\logs\laravel.log -Tail 50"
echo.
echo ============================================
pause

