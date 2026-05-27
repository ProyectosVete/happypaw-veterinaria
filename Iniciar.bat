@echo off
cd /d "%~dp0"
cd backend
start /B python manage.py runserver 8000
timeout /t 3 /nobreak > nul
start http://localhost:8000
echo Sistema iniciado
pause > nul
taskkill /f /im python.exe