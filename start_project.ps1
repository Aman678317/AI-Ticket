Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  🚀 Launching Enterprise AI Support Ticket System" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

# Start Backend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'c:\Users\acer\Desktop\Ai ticket'; pip install -r backend/requirements.txt; python run_backend.py`""

# Start Frontend
Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'c:\Users\acer\Desktop\Ai ticket\frontend'; npm install; npm run dev`""

Write-Host "Backend API: http://127.0.0.1:8000" -ForegroundColor Yellow
Write-Host "Frontend UI: http://localhost:3000" -ForegroundColor Green
