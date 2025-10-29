@echo off
echo ========================================
echo Installing MongoDB Package
echo ========================================
echo.

composer require jenssegers/mongodb

echo.
echo ========================================
echo Dumping autoload...
echo ========================================
composer dump-autoload -o

echo.
echo ========================================
echo Done! Now restart server with:
echo php artisan serve
echo ========================================
pause

