from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import os
from datetime import datetime, timedelta
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AtmosAI AI Service",
    description="AI-powered weather analysis and recommendations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key validation (simplified)
def verify_api_key(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.split(" ")[1]
    expected_token = os.getenv("AI_SERVICE_API_KEY", "default-key")
    
    if token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid API key")
    
    return token

# Pydantic models
class WeatherData(BaseModel):
    current: Dict[str, Any]
    forecast: List[Dict[str, Any]] = []
    hourly: List[Dict[str, Any]] = []
    alerts: List[Dict[str, Any]] = []

class UserPreferences(BaseModel):
    temperature_unit: str = "fahrenheit"
    notifications: Dict[str, bool] = {}
    health_tips_enabled: bool = True
    activity_suggestions: bool = True

class Location(BaseModel):
    name: str
    lat: float
    lng: float
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

class WeatherAnalysisRequest(BaseModel):
    weather_data: WeatherData
    user_preferences: Optional[UserPreferences] = None
    location: Optional[Location] = None

# Simple AI Analysis
def analyze_weather_simple(weather_data: WeatherData) -> Dict[str, Any]:
    """Simple weather analysis without heavy ML dependencies"""
    current = weather_data.current
    
    # Basic temperature analysis
    temp = current.get('temperature', 70)
    if temp > 85:
        temp_condition = "hot"
        temp_recommendations = ["Stay hydrated", "Avoid prolonged sun exposure", "Wear light clothing"]
    elif temp < 32:
        temp_condition = "cold"
        temp_recommendations = ["Dress warmly", "Protect extremities", "Limit outdoor time"]
    else:
        temp_condition = "comfortable"
        temp_recommendations = ["Enjoy outdoor activities"]
    
    # Humidity analysis
    humidity = current.get('humidity', 50)
    if humidity > 80:
        humidity_condition = "high"
        humidity_recommendations = ["Use fans or AC", "Stay hydrated", "Avoid strenuous activities"]
    elif humidity < 30:
        humidity_condition = "low"
        humidity_recommendations = ["Use moisturizer", "Stay hydrated", "Consider humidifier"]
    else:
        humidity_condition = "comfortable"
        humidity_recommendations = ["Normal humidity levels"]
    
    # UV Index analysis
    uv_index = current.get('uvIndex', 0)
    if uv_index >= 8:
        uv_condition = "very_high"
        uv_recommendations = ["Avoid sun 10am-4pm", "Apply SPF 30+ sunscreen", "Wear protective clothing"]
    elif uv_index >= 6:
        uv_condition = "moderate"
        uv_recommendations = ["Apply sunscreen", "Wear sunglasses", "Limit sun exposure"]
    else:
        uv_condition = "low"
        uv_recommendations = ["Minimal sun protection needed"]
    
    # Air Quality analysis
    air_quality = current.get('airQuality', {})
    aqi = air_quality.get('aqi', 0)
    if aqi >= 100:
        air_condition = "unhealthy"
        air_recommendations = ["Limit outdoor activities", "Keep windows closed", "Use air purifiers"]
    elif aqi >= 50:
        air_condition = "moderate"
        air_recommendations = ["Sensitive groups should limit outdoor time", "Monitor air quality"]
    else:
        air_condition = "good"
        air_recommendations = ["Good air quality for outdoor activities"]
    
    # Overall risk assessment
    risk_factors = []
    if temp > 90 or temp < 20:
        risk_factors.append("extreme_temperature")
    if uv_index > 8:
        risk_factors.append("high_uv")
    if aqi > 100:
        risk_factors.append("poor_air_quality")
    if humidity > 90:
        risk_factors.append("high_humidity")
    
    if len(risk_factors) >= 2:
        overall_risk = "high"
    elif len(risk_factors) >= 1:
        overall_risk = "moderate"
    else:
        overall_risk = "low"
    
    return {
        "temperature_analysis": {
            "condition": temp_condition,
            "risk": "high" if temp > 90 or temp < 20 else "low",
            "recommendations": temp_recommendations
        },
        "humidity_analysis": {
            "condition": humidity_condition,
            "risk": "moderate" if humidity > 80 or humidity < 30 else "low",
            "recommendations": humidity_recommendations
        },
        "uv_analysis": {
            "condition": uv_condition,
            "risk": "high" if uv_index >= 8 else "moderate" if uv_index >= 6 else "low",
            "recommendations": uv_recommendations
        },
        "air_quality_analysis": {
            "condition": air_condition,
            "risk": "high" if aqi >= 100 else "moderate" if aqi >= 50 else "low",
            "recommendations": air_recommendations
        },
        "overall_risk": {
            "level": overall_risk,
            "factors": risk_factors,
            "recommendations": get_overall_recommendations(overall_risk)
        },
        "timestamp": datetime.now().isoformat()
    }

def get_overall_recommendations(risk_level: str) -> List[str]:
    if risk_level == "high":
        return [
            "Avoid outdoor activities if possible",
            "Take all necessary precautions",
            "Monitor weather conditions closely"
        ]
    elif risk_level == "moderate":
        return [
            "Exercise caution with outdoor activities",
            "Take appropriate precautions"
        ]
    else:
        return [
            "Good conditions for outdoor activities",
            "Enjoy the weather safely"
        ]

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AtmosAI AI Service",
        "version": "1.0.0",
        "uptime": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/analyze-weather")
async def analyze_weather(
    request: WeatherAnalysisRequest,
    api_key: str = Depends(verify_api_key)
):
    """Analyze weather conditions and provide AI insights"""
    try:
        analysis = analyze_weather_simple(request.weather_data)
        
        # Generate health tips
        health_tips = []
        if analysis['uv_analysis']['risk'] != 'low':
            health_tips.extend(analysis['uv_analysis']['recommendations'][:2])
        if analysis['air_quality_analysis']['risk'] != 'low':
            health_tips.extend(analysis['air_quality_analysis']['recommendations'][:2])
        if analysis['temperature_analysis']['risk'] != 'low':
            health_tips.extend(analysis['temperature_analysis']['recommendations'][:2])
        
        # Generate activity suggestions
        if analysis['overall_risk']['level'] == 'low':
            activity_suggestions = [
                'Great weather for outdoor activities',
                'Perfect for hiking or walking',
                'Ideal for sports and recreation'
            ]
        elif analysis['overall_risk']['level'] == 'moderate':
            activity_suggestions = [
                'Consider indoor activities',
                'Plan outdoor activities with precautions',
                'Have backup indoor options ready'
            ]
        else:
            activity_suggestions = [
                'Stay indoors if possible',
                'Focus on indoor activities',
                'Postpone outdoor plans'
            ]
        
        return {
            "analysis": analysis,
            "health_tips": health_tips[:5],
            "activity_suggestions": activity_suggestions,
            "risk_assessment": analysis['overall_risk'],
            "confidence": 0.85,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Weather analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Weather analysis failed")

@app.post("/generate-alerts")
async def generate_alerts(
    request: WeatherAnalysisRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate simple weather alerts"""
    try:
        current = request.weather_data.current
        alerts = []
        
        # Check for severe weather
        temp = current.get('temperature', 70)
        uv_index = current.get('uvIndex', 0)
        air_quality = current.get('airQuality', {}).get('aqi', 0)
        
        if temp > 90:
            alerts.append({
                "type": "moderate",
                "category": "temperature",
                "title": "Heat Advisory",
                "description": f"Temperature is {temp}°F. Take precautions in hot weather.",
                "precautions": ["Stay hydrated", "Avoid prolonged sun exposure", "Wear light clothing"]
            })
        
        if uv_index >= 8:
            alerts.append({
                "type": "info",
                "category": "uv",
                "title": "High UV Index Alert",
                "description": f"UV index is {uv_index}. Very high risk of sunburn.",
                "precautions": ["Apply SPF 30+ sunscreen", "Wear protective clothing", "Seek shade"]
            })
        
        if air_quality > 100:
            alerts.append({
                "type": "moderate",
                "category": "air-quality",
                "title": "Air Quality Alert",
                "description": f"Air quality index is {air_quality}. Limit outdoor activities.",
                "precautions": ["Limit outdoor activities", "Keep windows closed", "Use air purifiers"]
            })
        
        return {
            "alerts": alerts,
            "total_alerts": len(alerts),
            "confidence": 0.90,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Alert generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Alert generation failed")

@app.post("/event-recommendations")
async def event_recommendations(
    request: WeatherAnalysisRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate simple event recommendations"""
    try:
        current = request.weather_data.current
        temp = current.get('temperature', 70)
        condition = current.get('condition', {}).get('main', '').lower()
        
        if temp > 85 or temp < 32:
            suitable_activities = [
                'Indoor activities',
                'Museum visits',
                'Library reading',
                'Indoor sports'
            ]
            weather_considerations = [
                'Extreme temperature conditions',
                'Limit outdoor exposure'
            ]
        elif condition in ['rain', 'storm', 'thunderstorm']:
            suitable_activities = [
                'Indoor entertainment',
                'Movie theaters',
                'Shopping malls',
                'Indoor games'
            ]
            weather_considerations = [
                'Wet weather conditions',
                'Avoid outdoor activities'
            ]
        else:
            suitable_activities = [
                'Outdoor sports',
                'Hiking and walking',
                'Picnics and barbecues',
                'Gardening'
            ]
            weather_considerations = [
                'Good weather conditions',
                'Enjoy outdoor activities'
            ]
        
        return {
            "suitable_activities": suitable_activities,
            "weather_considerations": weather_considerations,
            "optimal_times": ["Morning (8-11 AM)", "Afternoon (2-5 PM)", "Evening (6-8 PM)"],
            "confidence": 0.88,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Event recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Event recommendations failed")

@app.post("/health-insights")
async def health_insights(
    request: WeatherAnalysisRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate simple health insights"""
    try:
        current = request.weather_data.current
        temp = current.get('temperature', 70)
        humidity = current.get('humidity', 50)
        uv_index = current.get('uvIndex', 0)
        air_quality = current.get('airQuality', {}).get('aqi', 0)
        
        general_tips = [
            'Stay hydrated throughout the day',
            'Dress appropriately for the weather',
            'Monitor air quality for outdoor activities'
        ]
        
        weather_specific = {}
        
        if temp > 85:
            weather_specific['hot_weather'] = [
                'Drink 8-10 glasses of water daily',
                'Avoid alcohol and caffeine',
                'Wear light, loose clothing'
            ]
        elif temp < 32:
            weather_specific['cold_weather'] = [
                'Layer clothing for warmth',
                'Protect hands, feet, and head',
                'Stay dry to prevent hypothermia'
            ]
        
        if air_quality > 100:
            weather_specific['poor_air_quality'] = [
                'Limit outdoor activities',
                'Use air purifiers indoors',
                'Keep windows closed'
            ]
        
        risk_factors = []
        if temp > 90 or temp < 20:
            risk_factors.append('Extreme temperature exposure')
        if uv_index > 8:
            risk_factors.append('High UV exposure')
        if air_quality > 150:
            risk_factors.append('Poor air quality')
        
        if not risk_factors:
            risk_factors.append('Normal risk level for current conditions')
        
        return {
            "general_tips": general_tips,
            "weather_specific": weather_specific,
            "risk_factors": risk_factors,
            "confidence": 0.87,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health insights error: {str(e)}")
        raise HTTPException(status_code=500, detail="Health insights failed")

if __name__ == "__main__":
    uvicorn.run(
        "main-simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
