const express = require('express');
const axios = require('axios');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// AI Service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
// Default to the AI service's default key so local dev works out of the box
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || 'default-key';

// @route   POST /api/ai/analyze-weather
// @desc    Get AI weather analysis and recommendations
// @access  Public
router.post('/analyze-weather', optionalAuth, async (req, res) => {
  try {
    const { weatherData, userPreferences, location } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({
        success: false,
        message: 'Weather data is required'
      });
    }
    
    // Call Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/analyze-weather`, {
      weather_data: weatherData,
      user_preferences: userPreferences,
      location: location
    }, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('AI weather analysis error:', error.response?.data || error.message);
    
    // Fallback to basic analysis if AI service is unavailable
    const fallbackAnalysis = {
      health_tips: [
        'Stay hydrated and wear appropriate clothing',
        'Check air quality before outdoor activities',
        'Apply sunscreen if UV index is high'
      ],
      activity_suggestions: [
        'Consider indoor activities if weather is poor',
        'Plan outdoor activities for better weather days',
        'Check weather alerts before heading out'
      ],
      risk_assessment: {
        level: 'low',
        factors: ['normal weather conditions'],
        recommendations: ['No special precautions needed']
      }
    };
    
    res.json({
      success: true,
      data: fallbackAnalysis,
      fallback: true
    });
  }
});

// @route   POST /api/ai/generate-alerts
// @desc    Generate AI-powered weather alerts
// @access  Public
router.post('/generate-alerts', optionalAuth, async (req, res) => {
  try {
    const { weatherData, location, userPreferences } = req.body;
    
    if (!weatherData || !location) {
      return res.status(400).json({
        success: false,
        message: 'Weather data and location are required'
      });
    }
    
    // Call Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/generate-alerts`, {
      weather_data: weatherData,
      location: location,
      user_preferences: userPreferences
    }, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('AI alert generation error:', error.response?.data || error.message);
    
    // Fallback to basic alert generation
    const fallbackAlerts = [];
    
    if (weatherData.current.uvIndex > 8) {
      fallbackAlerts.push({
        type: 'moderate',
        category: 'uv',
        title: 'High UV Index Alert',
        description: `UV index is ${weatherData.current.uvIndex}. Take precautions when outdoors.`,
        precautions: [
          'Apply SPF 30+ sunscreen',
          'Wear protective clothing',
          'Seek shade during peak hours'
        ]
      });
    }
    
    if (weatherData.current.airQuality?.aqi > 100) {
      fallbackAlerts.push({
        type: 'moderate',
        category: 'air-quality',
        title: 'Air Quality Alert',
        description: 'Air quality may be unhealthy for sensitive groups.',
        precautions: [
          'Limit outdoor activities',
          'Keep windows closed',
          'Use air purifiers if available'
        ]
      });
    }
    
    res.json({
      success: true,
      data: fallbackAlerts,
      fallback: true
    });
  }
});

// @route   POST /api/ai/event-recommendations
// @desc    Get AI-powered event recommendations
// @access  Public
router.post('/event-recommendations', optionalAuth, async (req, res) => {
  try {
    const { weatherData, userPreferences, eventType, date } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({
        success: false,
        message: 'Weather data is required'
      });
    }
    
    // Call Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/event-recommendations`, {
      weather_data: weatherData,
      user_preferences: userPreferences,
      event_type: eventType,
      date: date
    }, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('AI event recommendations error:', error.response?.data || error.message);
    
    // Fallback to basic recommendations
    const fallbackRecommendations = {
      suitable_activities: [
        'Indoor activities like reading or cooking',
        'Light outdoor activities if weather permits',
        'Exercise at home or gym'
      ],
      weather_considerations: [
        'Check current conditions before planning',
        'Have backup indoor options ready',
        'Monitor weather alerts'
      ],
      optimal_times: [
        'Morning hours for outdoor activities',
        'Afternoon for indoor activities',
        'Evening for social gatherings'
      ]
    };
    
    res.json({
      success: true,
      data: fallbackRecommendations,
      fallback: true
    });
  }
});

// @route   POST /api/ai/health-insights
// @desc    Get AI-powered health insights
// @access  Public
router.post('/health-insights', optionalAuth, async (req, res) => {
  try {
    const { weatherData, userHealthData, location } = req.body;
    
    if (!weatherData) {
      return res.status(400).json({
        success: false,
        message: 'Weather data is required'
      });
    }
    
    // Call Python AI service
    const response = await axios.post(`${AI_SERVICE_URL}/health-insights`, {
      weather_data: weatherData,
      user_health_data: userHealthData,
      location: location
    }, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    logger.error('AI health insights error:', error.response?.data || error.message);
    
    // Fallback to basic health insights
    const fallbackInsights = {
      general_tips: [
        'Stay hydrated, especially in hot weather',
        'Dress appropriately for the temperature',
        'Monitor air quality for outdoor activities'
      ],
      weather_specific: {
        hot_weather: ['Drink plenty of water', 'Avoid peak sun hours', 'Wear light clothing'],
        cold_weather: ['Layer clothing', 'Protect extremities', 'Stay dry'],
        poor_air_quality: ['Limit outdoor time', 'Use air purifiers', 'Wear masks if needed']
      },
      risk_factors: ['Normal risk level for current conditions']
    };
    
    res.json({
      success: true,
      data: fallbackInsights,
      fallback: true
    });
  }
});

// @route   GET /api/ai/status
// @desc    Check AI service status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${AI_SERVICE_API_KEY}`
      },
      timeout: 5000
    });
    
    res.json({
      success: true,
      data: {
        status: 'connected',
        service: 'AI Service',
        version: response.data.version || 'unknown',
        uptime: response.data.uptime || 'unknown'
      }
    });
  } catch (error) {
    logger.error('AI service status check error:', error.message);
    
    res.json({
      success: false,
      data: {
        status: 'disconnected',
        service: 'AI Service',
        error: 'Service unavailable',
        fallback: true
      }
    });
  }
});

module.exports = router;
