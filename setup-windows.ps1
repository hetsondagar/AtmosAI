# AtmosAI Setup Script for Windows
# Run this script in PowerShell as Administrator

Write-Host "🚀 Setting up AtmosAI Backend System..." -ForegroundColor Green

# Check if Python is installed
Write-Host "`n📋 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Installing Python..." -ForegroundColor Red
    Write-Host "Please install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Write-Host "After installing Python, run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is installed
Write-Host "`n📋 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is running
Write-Host "`n📋 Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoStatus = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoStatus -and $mongoStatus.Status -eq "Running") {
        Write-Host "✅ MongoDB is running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB not running. Starting MongoDB..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MongoDB" -ErrorAction Stop
            Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Could not start MongoDB. Please install MongoDB from: https://www.mongodb.com/try/download/community" -ForegroundColor Red
            Write-Host "Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  MongoDB service not found. Please install MongoDB or use MongoDB Atlas" -ForegroundColor Yellow
}

# Setup Server
Write-Host "`n🔧 Setting up Node.js server..." -ForegroundColor Yellow
Set-Location "server"

# Install dependencies
Write-Host "Installing server dependencies..." -ForegroundColor Cyan
npm install

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your API keys." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Setup AI Service
Write-Host "`n🐍 Setting up Python AI service..." -ForegroundColor Yellow
Set-Location "../ai-service"

# Create virtual environment
Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Copy-Item "env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your API keys." -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Setup Client
Write-Host "`n⚛️  Setting up React client..." -ForegroundColor Yellow
Set-Location "../client"

# Install dependencies
Write-Host "Installing client dependencies..." -ForegroundColor Cyan
npm install

# Fix security vulnerabilities
Write-Host "Fixing security vulnerabilities..." -ForegroundColor Cyan
npm audit fix --force

# Go back to root directory
Set-Location ".."

Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Get OpenWeather API key from: https://openweathermap.org/api" -ForegroundColor White
Write-Host "2. Edit server/.env and ai-service/.env with your API keys" -ForegroundColor White
Write-Host "3. Start the services:" -ForegroundColor White
Write-Host "   - Server: cd server && npm run dev" -ForegroundColor White
Write-Host "   - AI Service: cd ai-service && .\venv\Scripts\Activate.ps1 && python run.py" -ForegroundColor White
Write-Host "   - Client: cd client && npm run dev" -ForegroundColor White
Write-Host "`n🌐 Your app will be available at:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   - AI Service: http://localhost:8000" -ForegroundColor White
