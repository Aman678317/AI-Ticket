@echo off
title Launching AI Support Ticket System
echo ============================================================
echo   🚀 Starting Enterprise AI Support Ticket System
echo ============================================================
echo.

echo Installing backend dependencies if needed...
pip install -r backend/requirements.txt

echo.
echo Launching Backend API Server in a new window...
start "Backend API Server (FastAPI)" cmd /k "cd /d c:\Users\acer\Desktop\Ai ticket && python run_backend.py"

echo.
echo Installing frontend dependencies if needed...
cd /d "c:\Users\acer\Desktop\Ai ticket\frontend"
call npm install

echo.
echo Launching Frontend Development Server in a new window...
start "Frontend UI (Vite)" cmd /k "cd /d c:\Users\acer\Desktop\Ai ticket\frontend && npm run dev"

echo.
echo ============================================================
echo   ✅ System Started Successfully!
echo   
echo   Frontend UI:  http://localhost:3000
echo   Backend API:  http://127.0.0.1:8000
echo   API Docs:     http://127.0.0.1:8000/docs
echo ============================================================
pause
