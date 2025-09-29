# AtmosAI Backend Server

A comprehensive backend server for the AtmosAI weather application, built with Node.js, Express, and MongoDB.

## Features

- **Weather Data Integration**: Real-time weather data from OpenWeather API
- **User Authentication**: JWT-based authentication with user management
- **Event Management**: Smart event planning with weather-aware suggestions
- **Alert System**: AI-powered weather alerts and notifications
- **AI Integration**: Python-based AI service for weather analysis
- **Real-time Updates**: Socket.IO for live weather updates
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **AI Service**: Python FastAPI
- **Caching**: Redis (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in your `.env` file

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/atmosai
REDIS_URL=redis://localhost:6379

# JWT Secret
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

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences

### Weather
- `GET /api/weather/current` - Get current weather
- `GET /api/weather/forecast` - Get weather forecast
- `GET /api/weather/hourly` - Get hourly forecast
- `GET /api/weather/alerts` - Get weather alerts

### Events
- `GET /api/events` - Get user events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/calendar/:year/:month` - Get calendar events

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get specific alert
- `POST /api/alerts` - Create alert (admin)
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/preferences` - Update preferences
- `GET /api/users/stats` - Get user statistics

### AI Service
- `POST /api/ai/analyze-weather` - Weather analysis
- `POST /api/ai/generate-alerts` - Generate alerts
- `POST /api/ai/event-recommendations` - Event recommendations
- `POST /api/ai/health-insights` - Health insights

## Database Models

### User
- Personal information and preferences
- Authentication data
- Streak tracking
- Location settings

### Event
- Event details and scheduling
- Weather preferences
- Recurrence patterns
- Weather impact analysis

### Alert
- Weather alerts and warnings
- Location-based targeting
- Severity levels
- Precautions and recommendations

### WeatherData
- Current weather conditions
- Forecast data
- Historical data
- Caching for performance

## Real-time Features

The server uses Socket.IO for real-time updates:

- **Weather Updates**: Live weather data updates
- **Alert Notifications**: Real-time weather alerts
- **Event Reminders**: Event-based notifications
- **Location-based Updates**: Updates for specific locations

## AI Integration

The backend integrates with a Python FastAPI service for:

- **Weather Analysis**: AI-powered weather insights
- **Alert Generation**: Smart weather alerts
- **Event Recommendations**: Weather-aware activity suggestions
- **Health Insights**: Weather-based health recommendations

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API rate limiting
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Request validation with Joi
- **Error Handling**: Comprehensive error handling
- **Logging**: Detailed logging with Winston

## Development

### Scripts
```bash
npm run dev      # Start development server
npm start        # Start production server
npm test         # Run tests
```

### Code Structure
```
server/
├── src/
│   ├── config/          # Database and app configuration
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── index.js         # Main server file
├── logs/                # Log files
├── package.json
└── README.md
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up reverse proxy (nginx)
4. Configure SSL certificates
5. Set up monitoring and logging

### Docker Support
```bash
# Build Docker image
docker build -t atmosai-server .

# Run container
docker run -p 5000:5000 atmosai-server
```

## Monitoring

- **Health Check**: `GET /health`
- **Logging**: Winston with file and console output
- **Error Tracking**: Comprehensive error handling
- **Performance**: Request timing and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
