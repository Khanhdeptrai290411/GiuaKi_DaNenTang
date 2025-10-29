@echo off
echo Clearing Laravel cache...
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

echo.
echo Dumping autoload...
composer dump-autoload

echo.
echo Done! Now restart your server with: php artisan serve
pause

