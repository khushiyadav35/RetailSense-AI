@echo off
echo ========================================================
echo   RetailSense AI - Intelligent Retail Analytics Platform
echo ========================================================
echo Starting FastAPI Backend + Production Frontend on http://localhost:8000 ...

start "" http://localhost:8000
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000
pause
