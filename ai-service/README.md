# AtmosAI AI Service

A Python FastAPI service that provides AI-powered weather analysis, alert generation, and intelligent recommendations for the AtmosAI application.

## Features

- **Weather Analysis**: AI-powered weather condition analysis
- **Alert Generation**: Smart weather alert creation
- **Event Recommendations**: Weather-aware activity suggestions
- **Health Insights**: Weather-based health recommendations
- **Risk Assessment**: Comprehensive weather risk evaluation

## Tech Stack

- **Framework**: FastAPI
- **Runtime**: Python 3.8+
- **AI/ML**: scikit-learn, transformers
- **Data Processing**: pandas, numpy
- **HTTP Client**: httpx
- **Authentication**: JWT

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-service
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Start the service**
   ```bash
   # Development
   python run.py
   
   # Or directly
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

## Environment Variables

```env
# AI Service Configuration
AI_SERVICE_API_KEY=your-ai-service-api-key-here
PORT=8000
HOST=0.0.0.0

# Logging
LOG_LEVEL=info

# External APIs (if needed)
OPENAI_API_KEY=your-openai-api-key-here
WEATHER_API_KEY=your-weather-api-key-here
```

## API Endpoints

### Health Check
- `GET /health` - Service health status

### Weather Analysis
- `POST /analyze-weather` - Analyze weather conditions and provide insights

### Alert Generation
- `POST /generate-alerts` - Generate AI-powered weather alerts

### Event Recommendations
- `POST /event-recommendations` - Get weather-aware activity suggestions

### Health Insights
- `POST /health-insights` - Generate weather-based health recommendations

## Request/Response Examples

### Weather Analysis Request
```json
{
  "weather_data": {
    "current": {
      "temperature": 75,
      "humidity": 65,
      "uvIndex": 6,
      "windSpeed": 12,
      "airQuality": {
        "aqi": 42
      }
    },
    "forecast": [...],
    "hourly": [...],
    "alerts": [...]
  },
  "user_preferences": {
    "temperature_unit": "fahrenheit",
    "health_tips_enabled": true
  },
  "location": {
    "name": "San Francisco, CA",
    "lat": 37.7749,
    "lng": -122.4194
  }
}
```

### Weather Analysis Response
```json
{
  "analysis": {
    "temperature_analysis": {
      "condition": "comfortable",
      "risk": "low",
      "recommendations": ["Enjoy outdoor activities"]
    },
    "overall_risk": {
      "level": "low",
      "factors": [],
      "recommendations": ["Good conditions for outdoor activities"]
    }
  },
  "health_tips": [
    "Apply sunscreen if UV index is high",
    "Stay hydrated throughout the day"
  ],
  "activity_suggestions": [
    "Great weather for outdoor activities",
    "Perfect for hiking or walking"
  ],
  "confidence": 0.85
}
```

## AI Analysis Features

### Weather Analyzer
- **Temperature Analysis**: Hot/cold weather risk assessment
- **Humidity Analysis**: High/low humidity impact
- **UV Index Analysis**: Sun protection recommendations
- **Air Quality Analysis**: Health impact assessment
- **Wind Analysis**: Wind safety evaluation

### Alert Generator
- **Severe Weather Detection**: Storm, tornado, hurricane alerts
- **Air Quality Alerts**: Pollution and air quality warnings
- **UV Protection Alerts**: High UV index notifications
- **Temperature Alerts**: Heat/cold weather warnings

### Risk Assessment
- **Multi-factor Analysis**: Combined weather risk evaluation
- **Severity Levels**: Low, moderate, high risk classification
- **Recommendations**: Specific safety recommendations
- **Confidence Scoring**: AI confidence in analysis

## AI Models and Algorithms

### Weather Risk Assessment
```python
def _calculate_risk_level(self, conditions):
    high_risk_count = sum(1 for condition in conditions if condition['risk'] == 'high')
    moderate_risk_count = sum(1 for condition in conditions if condition['risk'] == 'moderate')
    
    if high_risk_count >= 2:
        return 'high'
    elif high_risk_count >= 1 or moderate_risk_count >= 3:
        return 'moderate'
    else:
        return 'low'
```

### Alert Severity Classification
- **Severe**: Life-threatening conditions
- **Moderate**: Health risks for sensitive groups
- **Info**: General weather information

### Activity Suitability Scoring
- **Weather Matching**: Event type vs weather conditions
- **Safety Assessment**: Risk-based activity filtering
- **Optimal Timing**: Best times for activities

## Development

### Code Structure
```
ai-service/
├── main.py              # FastAPI application
├── run.py               # Service runner
├── requirements.txt     # Python dependencies
├── env.example         # Environment template
└── README.md           # Documentation
```

### Key Classes

#### WeatherAnalyzer
- Analyzes weather conditions
- Provides risk assessments
- Generates recommendations

#### AlertGenerator
- Creates weather alerts
- Determines alert severity
- Generates safety precautions

### Adding New Features

1. **Create new endpoint** in `main.py`
2. **Add request/response models** using Pydantic
3. **Implement analysis logic** in appropriate class
4. **Add error handling** and logging
5. **Update documentation**

### Testing

```bash
# Run tests (when implemented)
pytest tests/

# Test specific endpoint
curl -X POST "http://localhost:8000/analyze-weather" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"weather_data": {...}}'
```

## Performance Optimization

### Caching
- **Response Caching**: Cache analysis results
- **Model Caching**: Cache ML model predictions
- **Database Caching**: Cache weather data

### Async Processing
- **Background Tasks**: Non-blocking analysis
- **Batch Processing**: Multiple requests handling
- **Queue Management**: Request queuing system

## Monitoring and Logging

### Health Monitoring
- **Service Health**: `/health` endpoint
- **Performance Metrics**: Response times, throughput
- **Error Tracking**: Exception monitoring

### Logging
- **Request Logging**: API request/response logging
- **Error Logging**: Exception and error tracking
- **Performance Logging**: Timing and resource usage

## Deployment

### Production Setup
```bash
# Install production dependencies
pip install -r requirements.txt

# Set environment variables
export AI_SERVICE_API_KEY=your-production-key
export PORT=8000

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Docker Support
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "run.py"]
```

### Environment Configuration
- **Development**: Local development setup
- **Staging**: Testing environment
- **Production**: Production deployment

## Security

### API Authentication
- **JWT Tokens**: Secure API access
- **API Key Validation**: Request authentication
- **Rate Limiting**: Request rate limiting

### Data Privacy
- **No Data Storage**: No persistent data storage
- **Request Validation**: Input validation
- **Error Handling**: Secure error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests and documentation
5. Submit a pull request

## License

MIT License - see LICENSE file for details
