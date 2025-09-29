from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
import os
from datetime import datetime, timedelta
import logging
import json

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

# API Key validation
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
    forecast: List[Dict[str, Any]]
    hourly: List[Dict[str, Any]]
    alerts: List[Dict[str, Any]]

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

class AlertGenerationRequest(BaseModel):
    weather_data: WeatherData
    location: Location
    user_preferences: Optional[UserPreferences] = None

class EventRecommendationRequest(BaseModel):
    weather_data: WeatherData
    user_preferences: Optional[UserPreferences] = None
    event_type: Optional[str] = None
    date: Optional[str] = None

class HealthInsightsRequest(BaseModel):
    weather_data: WeatherData
    user_health_data: Optional[Dict[str, Any]] = None
    location: Optional[Location] = None

# AI Analysis Classes
class WeatherAnalyzer:
    def __init__(self):
        self.risk_factors = {
            'temperature': {'hot': 85, 'cold': 32},
            'humidity': {'high': 80, 'low': 30},
            'uv_index': {'high': 8, 'moderate': 6},
            'wind_speed': {'high': 25, 'moderate': 15},
            'air_quality': {'unhealthy': 100, 'moderate': 50}
        }
    
    def analyze_weather_conditions(self, weather_data: WeatherData) -> Dict[str, Any]:
        """Analyze weather conditions and provide insights"""
        current = weather_data.current
        
        # Temperature analysis
        temp = current.get('temperature', 70)
        temp_condition = self._analyze_temperature(temp)
        
        # Humidity analysis
        humidity = current.get('humidity', 50)
        humidity_condition = self._analyze_humidity(humidity)
        
        # UV Index analysis
        uv_index = current.get('uvIndex', 0)
        uv_condition = self._analyze_uv_index(uv_index)
        
        # Air Quality analysis
        air_quality = current.get('airQuality', {})
        aqi = air_quality.get('aqi', 0)
        air_quality_condition = self._analyze_air_quality(aqi)
        
        # Wind analysis
        wind_speed = current.get('windSpeed', 0)
        wind_condition = self._analyze_wind(wind_speed)
        
        # Overall risk assessment
        risk_level = self._calculate_risk_level([
            temp_condition, humidity_condition, uv_condition, 
            air_quality_condition, wind_condition
        ])
        
        return {
            'temperature_analysis': temp_condition,
            'humidity_analysis': humidity_condition,
            'uv_analysis': uv_condition,
            'air_quality_analysis': air_quality_condition,
            'wind_analysis': wind_condition,
            'overall_risk': risk_level,
            'timestamp': datetime.now().isoformat()
        }
    
    def _analyze_temperature(self, temp: float) -> Dict[str, Any]:
        if temp > self.risk_factors['temperature']['hot']:
            return {
                'condition': 'hot',
                'risk': 'high',
                'recommendations': [
                    'Stay hydrated',
                    'Avoid prolonged sun exposure',
                    'Wear light, breathable clothing',
                    'Seek air conditioning'
                ]
            }
        elif temp < self.risk_factors['temperature']['cold']:
            return {
                'condition': 'cold',
                'risk': 'high',
                'recommendations': [
                    'Dress in layers',
                    'Protect extremities',
                    'Stay dry',
                    'Limit outdoor time'
                ]
            }
        else:
            return {
                'condition': 'comfortable',
                'risk': 'low',
                'recommendations': ['Enjoy outdoor activities']
            }
    
    def _analyze_humidity(self, humidity: float) -> Dict[str, Any]:
        if humidity > self.risk_factors['humidity']['high']:
            return {
                'condition': 'high_humidity',
                'risk': 'moderate',
                'recommendations': [
                    'Stay hydrated',
                    'Avoid strenuous activities',
                    'Use fans or air conditioning'
                ]
            }
        elif humidity < self.risk_factors['humidity']['low']:
            return {
                'condition': 'low_humidity',
                'risk': 'low',
                'recommendations': [
                    'Use moisturizer',
                    'Stay hydrated',
                    'Consider humidifier'
                ]
            }
        else:
            return {
                'condition': 'comfortable',
                'risk': 'low',
                'recommendations': ['Normal humidity levels']
            }
    
    def _analyze_uv_index(self, uv_index: float) -> Dict[str, Any]:
        if uv_index >= self.risk_factors['uv_index']['high']:
            return {
                'condition': 'very_high',
                'risk': 'high',
                'recommendations': [
                    'Avoid sun 10am-4pm',
                    'Apply SPF 30+ sunscreen',
                    'Wear protective clothing',
                    'Seek shade'
                ]
            }
        elif uv_index >= self.risk_factors['uv_index']['moderate']:
            return {
                'condition': 'moderate',
                'risk': 'moderate',
                'recommendations': [
                    'Apply sunscreen',
                    'Wear sunglasses',
                    'Limit sun exposure'
                ]
            }
        else:
            return {
                'condition': 'low',
                'risk': 'low',
                'recommendations': ['Minimal sun protection needed']
            }
    
    def _analyze_air_quality(self, aqi: float) -> Dict[str, Any]:
        if aqi >= self.risk_factors['air_quality']['unhealthy']:
            return {
                'condition': 'unhealthy',
                'risk': 'high',
                'recommendations': [
                    'Limit outdoor activities',
                    'Keep windows closed',
                    'Use air purifiers',
                    'Wear N95 masks if outdoors'
                ]
            }
        elif aqi >= self.risk_factors['air_quality']['moderate']:
            return {
                'condition': 'moderate',
                'risk': 'moderate',
                'recommendations': [
                    'Sensitive groups should limit outdoor time',
                    'Monitor air quality',
                    'Consider indoor activities'
                ]
            }
        else:
            return {
                'condition': 'good',
                'risk': 'low',
                'recommendations': ['Good air quality for outdoor activities']
            }
    
    def _analyze_wind(self, wind_speed: float) -> Dict[str, Any]:
        if wind_speed >= self.risk_factors['wind_speed']['high']:
            return {
                'condition': 'high_wind',
                'risk': 'high',
                'recommendations': [
                    'Avoid outdoor activities',
                    'Secure loose objects',
                    'Be cautious driving'
                ]
            }
        elif wind_speed >= self.risk_factors['wind_speed']['moderate']:
            return {
                'condition': 'moderate_wind',
                'risk': 'moderate',
                'recommendations': [
                    'Be cautious with outdoor activities',
                    'Secure loose items',
                    'Consider wind chill'
                ]
            }
        else:
            return {
                'condition': 'calm',
                'risk': 'low',
                'recommendations': ['Pleasant wind conditions']
            }
    
    def _calculate_risk_level(self, conditions: List[Dict[str, Any]]) -> Dict[str, Any]:
        high_risk_count = sum(1 for condition in conditions if condition['risk'] == 'high')
        moderate_risk_count = sum(1 for condition in conditions if condition['risk'] == 'moderate')
        
        if high_risk_count >= 2:
            overall_risk = 'high'
        elif high_risk_count >= 1 or moderate_risk_count >= 3:
            overall_risk = 'moderate'
        else:
            overall_risk = 'low'
        
        return {
            'level': overall_risk,
            'factors': [condition['condition'] for condition in conditions if condition['risk'] != 'low'],
            'recommendations': self._get_overall_recommendations(overall_risk)
        }
    
    def _get_overall_recommendations(self, risk_level: str) -> List[str]:
        if risk_level == 'high':
            return [
                'Avoid outdoor activities if possible',
                'Take all necessary precautions',
                'Monitor weather conditions closely',
                'Have emergency plans ready'
            ]
        elif risk_level == 'moderate':
            return [
                'Exercise caution with outdoor activities',
                'Take appropriate precautions',
                'Monitor conditions for changes'
            ]
        else:
            return [
                'Good conditions for outdoor activities',
                'Enjoy the weather safely'
            ]

class AlertGenerator:
    def __init__(self):
        self.alert_templates = {
            'severe_weather': {
                'type': 'severe',
                'category': 'weather',
                'precautions': [
                    'Stay indoors and away from windows',
                    'Avoid using electrical appliances',
                    'Do not drive through flooded roads',
                    'Keep emergency supplies ready'
                ]
            },
            'air_quality': {
                'type': 'moderate',
                'category': 'air-quality',
                'precautions': [
                    'Limit outdoor activities',
                    'Keep windows and doors closed',
                    'Use air purifiers if available',
                    'Wear N95 masks when outdoors'
                ]
            },
            'uv_protection': {
                'type': 'info',
                'category': 'uv',
                'precautions': [
                    'Apply SPF 30+ sunscreen every 2 hours',
                    'Wear protective clothing and sunglasses',
                    'Seek shade during peak hours',
                    'Stay hydrated'
                ]
            }
        }
    
    def generate_alerts(self, weather_data: WeatherData, location: Location) -> List[Dict[str, Any]]:
        """Generate weather alerts based on current conditions"""
        alerts = []
        current = weather_data.current
        
        # Check for severe weather conditions
        if self._is_severe_weather(current):
            alerts.append(self._create_severe_weather_alert(current, location))
        
        # Check air quality
        air_quality = current.get('airQuality', {})
        aqi = air_quality.get('aqi', 0)
        if aqi > 100:
            alerts.append(self._create_air_quality_alert(aqi, location))
        
        # Check UV index
        uv_index = current.get('uvIndex', 0)
        if uv_index >= 8:
            alerts.append(self._create_uv_alert(uv_index, location))
        
        # Check temperature extremes
        temp = current.get('temperature', 70)
        if temp > 90 or temp < 20:
            alerts.append(self._create_temperature_alert(temp, location))
        
        return alerts
    
    def _is_severe_weather(self, current: Dict[str, Any]) -> bool:
        """Check if current conditions indicate severe weather"""
        condition = current.get('condition', {}).get('main', '').lower()
        wind_speed = current.get('windSpeed', 0)
        
        severe_conditions = ['thunderstorm', 'tornado', 'hurricane', 'blizzard']
        return (condition in severe_conditions or wind_speed > 30)
    
    def _create_severe_weather_alert(self, current: Dict[str, Any], location: Location) -> Dict[str, Any]:
        condition = current.get('condition', {})
        return {
            'type': 'severe',
            'category': 'weather',
            'title': f'Severe Weather Warning - {condition.get("main", "Unknown")}',
            'description': f'Severe weather conditions detected in {location.name}. {condition.get("description", "")}',
            'location': {
                'name': location.name,
                'coordinates': {'lat': location.lat, 'lng': location.lng}
            },
            'startTime': datetime.now(),
            'endTime': datetime.now() + timedelta(hours=4),
            'precautions': self.alert_templates['severe_weather']['precautions'],
            'severity': {'level': 5, 'description': 'Extreme danger'},
            'isActive': True,
            'source': 'ai-generated'
        }
    
    def _create_air_quality_alert(self, aqi: float, location: Location) -> Dict[str, Any]:
        return {
            'type': 'moderate' if aqi < 150 else 'severe',
            'category': 'air-quality',
            'title': f'Air Quality Alert - AQI {aqi}',
            'description': f'Air quality index is {aqi} in {location.name}. {"Unhealthy for sensitive groups" if aqi < 150 else "Unhealthy for everyone"}.',
            'location': {
                'name': location.name,
                'coordinates': {'lat': location.lat, 'lng': location.lng}
            },
            'startTime': datetime.now(),
            'endTime': datetime.now() + timedelta(hours=6),
            'precautions': self.alert_templates['air_quality']['precautions'],
            'severity': {'level': 3 if aqi < 150 else 4, 'description': 'Moderate to high health risk'},
            'isActive': True,
            'source': 'ai-generated'
        }
    
    def _create_uv_alert(self, uv_index: float, location: Location) -> Dict[str, Any]:
        return {
            'type': 'info',
            'category': 'uv',
            'title': f'High UV Index Alert - {uv_index}',
            'description': f'UV index is {uv_index} in {location.name}. Very high risk of sunburn and skin damage.',
            'location': {
                'name': location.name,
                'coordinates': {'lat': location.lat, 'lng': location.lng}
            },
            'startTime': datetime.now(),
            'endTime': datetime.now() + timedelta(hours=8),
            'precautions': self.alert_templates['uv_protection']['precautions'],
            'severity': {'level': 3, 'description': 'High UV exposure risk'},
            'isActive': True,
            'source': 'ai-generated'
        }
    
    def _create_temperature_alert(self, temp: float, location: Location) -> Dict[str, Any]:
        alert_type = 'Heat Advisory' if temp > 90 else 'Cold Weather Alert'
        return {
            'type': 'moderate',
            'category': 'temperature',
            'title': alert_type,
            'description': f'Temperature is {temp}°F in {location.name}. {"Extreme heat" if temp > 90 else "Extreme cold"} conditions.',
            'location': {
                'name': location.name,
                'coordinates': {'lat': location.lat, 'lng': location.lng}
            },
            'startTime': datetime.now(),
            'endTime': datetime.now() + timedelta(hours=12),
            'precautions': [
                'Stay hydrated' if temp > 90 else 'Dress warmly',
                'Limit outdoor time',
                'Check on vulnerable individuals',
                'Monitor for heat/cold related symptoms'
            ],
            'severity': {'level': 3, 'description': 'Temperature health risk'},
            'isActive': True,
            'source': 'ai-generated'
        }

# Initialize analyzers
weather_analyzer = WeatherAnalyzer()
alert_generator = AlertGenerator()

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
        analysis = weather_analyzer.analyze_weather_conditions(request.weather_data)
        
        # Generate health tips based on analysis
        health_tips = []
        if analysis['uv_analysis']['risk'] != 'low':
            health_tips.extend(analysis['uv_analysis']['recommendations'])
        if analysis['air_quality_analysis']['risk'] != 'low':
            health_tips.extend(analysis['air_quality_analysis']['recommendations'])
        if analysis['temperature_analysis']['risk'] != 'low':
            health_tips.extend(analysis['temperature_analysis']['recommendations'])
        
        # Generate activity suggestions
        activity_suggestions = []
        if analysis['overall_risk']['level'] == 'low':
            activity_suggestions = [
                'Great weather for outdoor activities',
                'Perfect for hiking or walking',
                'Ideal for sports and recreation',
                'Good conditions for gardening'
            ]
        elif analysis['overall_risk']['level'] == 'moderate':
            activity_suggestions = [
                'Consider indoor activities',
                'Plan outdoor activities with precautions',
                'Have backup indoor options ready',
                'Monitor conditions throughout the day'
            ]
        else:
            activity_suggestions = [
                'Stay indoors if possible',
                'Focus on indoor activities',
                'Postpone outdoor plans',
                'Have emergency plans ready'
            ]
        
        return {
            "analysis": analysis,
            "health_tips": health_tips[:5],  # Limit to 5 tips
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
    request: AlertGenerationRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate AI-powered weather alerts"""
    try:
        alerts = alert_generator.generate_alerts(request.weather_data, request.location)
        
        return {
            "alerts": alerts,
            "total_alerts": len(alerts),
            "severity_distribution": {
                "severe": len([a for a in alerts if a['type'] == 'severe']),
                "moderate": len([a for a in alerts if a['type'] == 'moderate']),
                "info": len([a for a in alerts if a['type'] == 'info'])
            },
            "confidence": 0.90,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Alert generation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Alert generation failed")

@app.post("/event-recommendations")
async def event_recommendations(
    request: EventRecommendationRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate AI-powered event recommendations"""
    try:
        current = request.weather_data.current
        temp = current.get('temperature', 70)
        condition = current.get('condition', {}).get('main', '').lower()
        uv_index = current.get('uvIndex', 0)
        air_quality = current.get('airQuality', {}).get('aqi', 0)
        
        # Determine suitable activities based on weather
        suitable_activities = []
        weather_considerations = []
        optimal_times = []
        
        if temp > 85 or temp < 32:
            suitable_activities = [
                'Indoor activities',
                'Museum visits',
                'Library reading',
                'Indoor sports',
                'Cooking classes'
            ]
            weather_considerations = [
                'Extreme temperature conditions',
                'Limit outdoor exposure',
                'Stay hydrated and comfortable'
            ]
        elif condition in ['rain', 'storm', 'thunderstorm']:
            suitable_activities = [
                'Indoor entertainment',
                'Movie theaters',
                'Shopping malls',
                'Indoor games',
                'Art galleries'
            ]
            weather_considerations = [
                'Wet weather conditions',
                'Avoid outdoor activities',
                'Have umbrella if going out'
            ]
        elif uv_index > 8 or air_quality > 100:
            suitable_activities = [
                'Indoor activities',
                'Gym workouts',
                'Indoor swimming',
                'Library visits',
                'Home activities'
            ]
            weather_considerations = [
                'High UV or poor air quality',
                'Limit sun exposure',
                'Use air purifiers indoors'
            ]
        else:
            suitable_activities = [
                'Outdoor sports',
                'Hiking and walking',
                'Picnics and barbecues',
                'Gardening',
                'Outdoor photography'
            ]
            weather_considerations = [
                'Good weather conditions',
                'Enjoy outdoor activities',
                'Apply sunscreen if needed'
            ]
        
        # Determine optimal times
        if temp > 80:
            optimal_times = ['Early morning (6-9 AM)', 'Evening (6-9 PM)']
        elif temp < 40:
            optimal_times = ['Midday (10 AM-2 PM)', 'Afternoon (2-5 PM)']
        else:
            optimal_times = ['Morning (8-11 AM)', 'Afternoon (2-5 PM)', 'Evening (6-8 PM)']
        
        return {
            "suitable_activities": suitable_activities,
            "weather_considerations": weather_considerations,
            "optimal_times": optimal_times,
            "confidence": 0.88,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Event recommendations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Event recommendations failed")

@app.post("/health-insights")
async def health_insights(
    request: HealthInsightsRequest,
    api_key: str = Depends(verify_api_key)
):
    """Generate AI-powered health insights"""
    try:
        current = request.weather_data.current
        temp = current.get('temperature', 70)
        humidity = current.get('humidity', 50)
        uv_index = current.get('uvIndex', 0)
        air_quality = current.get('airQuality', {}).get('aqi', 0)
        
        # Generate general health tips
        general_tips = [
            'Stay hydrated throughout the day',
            'Dress appropriately for the weather',
            'Monitor air quality for outdoor activities',
            'Get adequate sleep for immune health'
        ]
        
        # Weather-specific health advice
        weather_specific = {}
        
        if temp > 85:
            weather_specific['hot_weather'] = [
                'Drink 8-10 glasses of water daily',
                'Avoid alcohol and caffeine',
                'Wear light, loose clothing',
                'Take breaks in air conditioning',
                'Watch for heat exhaustion signs'
            ]
        elif temp < 32:
            weather_specific['cold_weather'] = [
                'Layer clothing for warmth',
                'Protect hands, feet, and head',
                'Stay dry to prevent hypothermia',
                'Limit time outdoors',
                'Warm up gradually after being outside'
            ]
        
        if humidity > 80:
            weather_specific['high_humidity'] = [
                'Use fans or air conditioning',
                'Avoid strenuous activities',
                'Stay in well-ventilated areas',
                'Monitor for heat-related illness'
            ]
        
        if air_quality > 100:
            weather_specific['poor_air_quality'] = [
                'Limit outdoor activities',
                'Use air purifiers indoors',
                'Wear N95 masks if going out',
                'Keep windows closed',
                'Avoid outdoor exercise'
            ]
        
        # Risk factors assessment
        risk_factors = []
        if temp > 90 or temp < 20:
            risk_factors.append('Extreme temperature exposure')
        if uv_index > 8:
            risk_factors.append('High UV exposure')
        if air_quality > 150:
            risk_factors.append('Poor air quality')
        if humidity > 90:
            risk_factors.append('High humidity stress')
        
        if not risk_factors:
            risk_factors.append('Normal risk level for current conditions')
        
        return {
            "general_tips": general_tips,
            "weather_specific": weather_specific,
            "risk_factors": risk_factors,
            "recommendations": {
                "immediate_actions": [
                    "Check current conditions before going out",
                    "Dress appropriately for the weather",
                    "Stay informed about weather changes"
                ],
                "long_term_health": [
                    "Maintain regular exercise routine",
                    "Eat a balanced diet",
                    "Get regular health checkups",
                    "Monitor weather-related health conditions"
                ]
            },
            "confidence": 0.87,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health insights error: {str(e)}")
        raise HTTPException(status_code=500, detail="Health insights failed")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
