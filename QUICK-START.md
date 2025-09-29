# 🚀 AtmosAI Quick Start Guide

## Current Status ✅
- ✅ Node.js server is running on port 5000
- ✅ MongoDB is connected
- ✅ Client dependencies installed
- ⚠️ Python AI service needs setup
- ⚠️ API keys need configuration

## Issues to Fix

### 1. Install Python
Since Python is not installed on your system:

**Option A: Install Python from Microsoft Store**
1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Install the latest version
4. Make sure to check "Add Python to PATH" during installation

**Option B: Install Python from Official Website**
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.12
3. Run the installer
4. ✅ **IMPORTANT**: Check "Add Python to PATH"
5. Complete installation

### 2. Get API Keys

#### OpenWeather API (Required)
1. Go to https://openweathermap.org/api
2. Sign up for a free account
3. Go to "API keys" section
4. Copy your API key
5. Add it to `server/.env` file

#### MongoDB (Already Working)
Your MongoDB is already connected and working! ✅

### 3. Configure Environment Files

#### Server Configuration (`server/.env`)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Already working)
MONGODB_URI=mongodb://localhost:27017/atmosai

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here-change-this
JWT_EXPIRE=7d

# Weather API (REQUIRED - Get from OpenWeather)
OPENWEATHER_API_KEY=your-openweather-api-key-here
WEATHER_API_BASE_URL=https://api.openweathermap.org/data/2.5

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-key

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### AI Service Configuration (`ai-service/.env`)
```env
# AI Service Configuration
AI_SERVICE_API_KEY=your-ai-service-key
PORT=8000
HOST=0.0.0.0

# Logging
LOG_LEVEL=info
```

## Step-by-Step Setup

### Step 1: Install Python
```powershell
# After installing Python, verify it works:
python --version
# Should show: Python 3.x.x
```

### Step 2: Setup AI Service (Simplified Version)
```powershell
# Navigate to AI service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install minimal dependencies (faster)
pip install -r requirements-simple.txt

# Create .env file
copy env.example .env

# Edit .env file with your API key
notepad .env
```

### Step 3: Configure API Keys
1. Get OpenWeather API key from https://openweathermap.org/api
2. Edit `server/.env` and add your OpenWeather API key
3. Edit `ai-service/.env` and set your AI service API key

### Step 4: Start All Services

#### Option A: Use the Batch File
```powershell
# Run this in the root directory
start-all.bat
```

#### Option B: Manual Start (3 separate terminals)

**Terminal 1 - Server:**
```powershell
cd server
npm run dev
```

**Terminal 2 - AI Service:**
```powershell
cd ai-service
.\venv\Scripts\Activate.ps1
python run-simple.py
```

**Terminal 3 - Client:**
```powershell
cd client
npm run dev
```

## Verification

### Check if everything is working:

1. **Server Health**: http://localhost:5000/health
2. **AI Service Health**: http://localhost:8000/health
3. **Frontend**: http://localhost:3000

### Test API Endpoints:
```powershell
# Test weather API (replace with your API key)
curl "http://localhost:5000/api/weather/current?lat=37.7749&lng=-122.4194"

# Test AI analysis
curl -X POST "http://localhost:5000/api/ai/analyze-weather" -H "Content-Type: application/json" -d "{\"weather_data\": {\"current\": {\"temperature\": 75, \"humidity\": 65}}}"
```

## Troubleshooting

### Python Issues
```powershell
# If Python command not found:
# 1. Restart your terminal
# 2. Check if Python is in PATH:
where python

# If still not working, try:
py --version
# Then use 'py' instead of 'python' in commands
```

### MongoDB Issues
```powershell
# Check if MongoDB is running:
Get-Service -Name "MongoDB"

# Start MongoDB if not running:
Start-Service -Name "MongoDB"
```

### Port Issues
```powershell
# Check what's using ports:
netstat -ano | findstr :5000
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill processes if needed:
taskkill /PID <PID_NUMBER> /F
```

## Expected Results

After setup, you should see:

1. **Server**: `Server running on port 5000 in development mode`
2. **AI Service**: `Starting AtmosAI AI Service (Simple Version) on 0.0.0.0:8000`
3. **Client**: `Ready - started server on 0.0.0.0:3000`

## Next Steps

1. ✅ Get OpenWeather API key
2. ✅ Install Python
3. ✅ Setup AI service
4. ✅ Configure environment files
5. ✅ Start all services
6. 🎉 Test your AtmosAI application!

## Support

If you encounter issues:
1. Check the logs in each terminal
2. Verify all services are running
3. Check API keys are correct
4. Ensure MongoDB is running
5. Restart all services if needed

Your AtmosAI backend is almost ready! 🚀
