@echo off
echo [INFO] Stopping all Loan Eligibility AI containers...
cd /d "%~dp0"
docker compose down
echo [OK] All containers have been stopped safely.
pause
