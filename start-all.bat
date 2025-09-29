@echo off
echo 🚀 Starting AtmosAI Services...
echo.

echo 📋 Starting Node.js Server...
start "AtmosAI Server" cmd /k "cd server && npm run dev"

echo 📋 Starting Python AI Service...
start "AtmosAI AI Service" cmd /k "cd ai-service && venv\Scripts\activate && python run.py"

echo 📋 Starting React Client...
start "AtmosAI Client" cmd /k "cd client && npm run dev"

echo.
echo ✅ All services are starting...
echo 🌐 Your app will be available at:
echo    - Frontend: http://localhost:3000
echo    - Backend API: http://localhost:5000
echo    - AI Service: http://localhost:8000
echo.
pause
