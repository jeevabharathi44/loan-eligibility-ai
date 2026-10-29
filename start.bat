@echo off
title Explainable AI (XAI) Digital Personal Loan Processing System - RBI Compliant
color 0b

echo ===============================================================================
echo     EXPLAINABLE AI (XAI) DIGITAL PERSONAL LOAN PROCESSING SYSTEM
echo     DigiLocker Single Sign-On (Meri Pehchaan) & Tri-Biometric Verification
echo     Reserve Bank of India (RBI) Digital Lending Guidelines Compliant
echo ===============================================================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+.
    pause
    exit /b 1
)

echo [1/3] Environment Verified:
python --version
node --version
echo.

:: Start FastAPI Backend
echo [2/3] Launching FastAPI Backend on http://localhost:8000...
start "XAI Backend (FastAPI - Port 8000)" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait 3 seconds for backend initialization
timeout /t 3 /nobreak >nul

:: Start Vite React Frontend
echo [3/3] Launching React Vite Frontend on http://localhost:3000...
start "XAI Frontend (Vite - Port 3000)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo.
echo ===============================================================================
echo  Services started successfully!
echo  - Frontend Web App:                     http://localhost:3000
echo  - DigiLocker SSO (Meri Pehchaan):       http://localhost:3000/login
echo  - Institutional Cockpit (Dr. Varman):   http://localhost:3000/admin
echo  - FastAPI Swagger API Docs:             http://localhost:8000/docs
echo  - System Health Check:                  http://localhost:8000/health
echo ===============================================================================
echo.
echo Opening browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo Press any key to stop all background windows...
pause >nul
taskkill /FI "WINDOWTITLE eq XAI Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq XAI Frontend*" /F >nul 2>&1
