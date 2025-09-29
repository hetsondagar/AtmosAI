# AtmosAI Complete Backend Setup Guide

This guide will help you set up the complete AtmosAI backend system with Node.js server and Python AI service.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning repositories)

## Quick Start

### 1. Clone and Setup Server

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 2. Setup AI Service

```bash
# Navigate to AI service directory
cd ../ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env file
nano .env
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# On macOS with Homebrew:
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# On Ubuntu/Debian:
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `MONGODB_URI` in your `.env` file

### 4. API Keys Setup

#### OpenWeather API
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key
4. Add it to your server `.env` file

#### Optional: OpenAI API (for enhanced AI features)
1. Go to [OpenAI](https://platform.openai.com/)
2. Create an account and get API key
3. Add it to your AI service `.env` file

## Configuration

### Server Configuration (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/atmosai
REDIS_URL=redis://localhost:6379

# JWT Secret (generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Weather API
OPENWEATHER_API_KEY=your-openweather-api-key
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

### AI Service Configuration (.env)

```env
# AI Service Configuration
AI_SERVICE_API_KEY=your-ai-service-key-here
PORT=8000
HOST=0.0.0.0

# Logging
LOG_LEVEL=info

# External APIs (optional)
OPENAI_API_KEY=your-openai-api-key-here
WEATHER_API_KEY=your-weather-api-key-here
```

## Running the Services

### Start AI Service (Terminal 1)
```bash
cd ai-service
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

### Start Server (Terminal 2)
```bash
cd server
npm run dev
```

### Start Frontend (Terminal 3)
```bash
cd client
npm run dev
```

## Verification

### Check Server Health
```bash
curl http://localhost:5000/health
```

### Check AI Service Health
```bash
curl http://localhost:8000/health
```

### Test API Endpoints
```bash
# Test weather endpoint
curl "http://localhost:5000/api/weather/current?lat=37.7749&lng=-122.4194"

# Test AI analysis
curl -X POST "http://localhost:5000/api/ai/analyze-weather" \
  -H "Content-Type: application/json" \
  -d '{"weather_data": {"current": {"temperature": 75, "humidity": 65}}}'
```

## Development Workflow

### 1. Database Management
```bash
# Connect to MongoDB
mongosh

# Use atmosai database
use atmosai

# View collections
show collections

# View users
db.users.find()

# View events
db.events.find()
```

### 2. API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 3. Logs and Debugging
```bash
# Server logs
tail -f server/logs/combined.log

# AI service logs (check terminal output)
# Server logs (check terminal output)
```

## Production Deployment

### 1. Environment Setup
```bash
# Set production environment
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/atmosai
```

### 2. Process Management
```bash
# Install PM2 for process management
npm install -g pm2

# Start server with PM2
pm2 start src/index.js --name atmosai-server

# Start AI service with PM2
pm2 start run.py --name atmosai-ai --interpreter python

# Save PM2 configuration
pm2 save
pm2 startup
```

### 3. Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ai/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Start MongoDB
brew services start mongodb-community
```

#### 2. Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :8000

# Kill process
kill -9 <PID>
```

#### 3. Python Dependencies Error
```bash
# Recreate virtual environment
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 4. Node Modules Error
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

#### Server Debug
```bash
# Run with debug logging
DEBUG=* npm run dev
```

#### AI Service Debug
```bash
# Run with verbose logging
LOG_LEVEL=debug python run.py
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Weather Endpoints
- `GET /api/weather/current` - Current weather
- `GET /api/weather/forecast` - Weather forecast
- `GET /api/weather/alerts` - Weather alerts

### Event Endpoints
- `GET /api/events` - Get user events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### AI Endpoints
- `POST /api/ai/analyze-weather` - Weather analysis
- `POST /api/ai/generate-alerts` - Generate alerts
- `POST /api/ai/event-recommendations` - Event recommendations

## Support

For issues and questions:
1. Check the logs for error messages
2. Verify all environment variables are set
3. Ensure all services are running
4. Check database connectivity
5. Verify API keys are valid

## Next Steps

1. **Customize AI Models**: Modify the AI analysis algorithms
2. **Add More APIs**: Integrate additional weather services
3. **Enhance Security**: Add rate limiting and security headers
4. **Monitoring**: Set up application monitoring
5. **Scaling**: Configure for horizontal scaling

## License

MIT License - see LICENSE file for details
