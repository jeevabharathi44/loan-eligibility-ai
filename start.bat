@echo off
echo ========================================================
echo   Explainable AI-Based Digital Personal Loan Platform
echo ========================================================
echo.

:: Check if user wants native local run or Docker
echo Select launch mode:
echo   [1] Local Native (FastAPI + Vite React) [RECOMMENDED - Instant Boot]
echo   [2] Docker Compose Containers (MySQL + ML + Backend + Frontend)
echo.
set /p choice="Enter choice [1 or 2, default 1]: "

if "%choice%"=="2" goto launch_docker

:launch_native
echo.
echo [1/3] Checking Python dependencies...
python -c "import fastapi, uvicorn, sqlalchemy, interpret" >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing required Python dependencies...
    pip install -r requirements_backend.txt
)

echo [2/3] Starting FastAPI Backend on http://localhost:5000...
start "FastAPI Backend" cmd /k "cd /d "%~dp0" && python run_backend.py"

echo [3/3] Starting Vite Frontend on http://localhost:3000...
start "React Citizen Portal" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

timeout /t 3 /nobreak >nul
echo.
echo ========================================================
echo   All Services are Running Locally!
echo ========================================================
echo   * Frontend (Citizen Portal): http://localhost:3000
echo   * Unified FastAPI API:       http://localhost:5000
echo   * Swagger Documentation:     http://localhost:5000/docs
echo   * Persistence Database:      loan_eligibility.db (SQLite)
echo ========================================================
echo.
start http://localhost:3000
exit /b 0

:launch_docker
echo.
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Starting Docker Desktop...
    if exist "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe" (
        start "" "%LOCALAPPDATA%\Programs\DockerDesktop\Docker Desktop.exe"
    ) else if exist "C:\Program Files\Docker\Docker\Docker Desktop.exe" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    )
    echo [INFO] Waiting for Docker engine...
    :wait_docker
    timeout /t 5 /nobreak >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 goto wait_docker
)

echo [INFO] Starting all containers...
docker compose up -d
echo.
echo ========================================================
echo   Docker containers started!
echo   * Frontend: http://localhost:3000
echo   * Backend:  http://localhost:5000
echo ========================================================
start http://localhost:3000
pause
