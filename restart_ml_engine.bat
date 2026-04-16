@echo off
echo ============================================================
echo ShopFusion ML Engine Restart Script
echo ============================================================
echo.

echo [1/3] Stopping existing ML engine on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Found process: %%a
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo [2/3] Starting ML engine...
cd ml-engine
start "ShopFusion ML Engine" cmd /k "python app.py"

echo [3/3] Waiting for ML engine to start...
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo ML Engine should now be running on http://localhost:8000
echo ============================================================
echo.
echo To test, run: cd ml-engine ^&^& python test_ml_endpoints.py
echo.
pause
