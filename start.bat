@echo off
echo ========================================================
echo       Loan Eligibility AI - Full Stack Platform
echo ========================================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Docker is not running. Starting Docker Desktop...
    if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" (
        start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
    ) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    )
    echo [INFO] Waiting for Docker engine to initialize...
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo [INFO] Still waiting for Docker engine...
        goto wait_docker
    )
    echo [OK] Docker engine is now ready!
)

echo [INFO] Starting all containers (Database, ML Service, Backend, Frontend)...
cd /d "%~dp0"
docker compose up -d

echo.
echo ========================================================
echo   All Services are Running!
echo ========================================================
echo   * Frontend (Citizen Portal): http://localhost:3000
echo   * Backend API:               http://localhost:5000
echo   * ML Service (FastAPI docs): http://localhost:8000/docs
echo   * MySQL 8.0:                 Port 3307
echo ========================================================
echo.
echo [INFO] Opening http://localhost:3000 in your browser...
start http://localhost:3000
echo.
echo Done! Keep Docker Desktop running in your system tray.
pause
