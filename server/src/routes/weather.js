const express = require('express');
const axios = require('axios');
const WeatherData = require('../models/WeatherData');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Weather API configuration
const WEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const WEATHER_API_BASE_URL = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org/data/2.5';

// Fetch Air Quality (OpenWeather Air Pollution API)
const fetchAirQuality = async (lat, lng) => {
  try {
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/air_pollution', {
      params: { lat, lon: lng, appid: WEATHER_API_KEY },
    });
    const point = data?.list?.[0];
    if (!point) return null;
    const aqi = point.main?.aqi; // 1..5
    const c = point.components || {};
    return {
      us_epa_index: aqi, // reuse field for our schema
      pm2_5: c.pm2_5,
      pm10: c.pm10,
      o3: c.o3,
      no2: c.no2,
      so2: c.so2,
      co: c.co,
    };
  } catch (e) {
    return null;
  }
};

// Try UV Index endpoint (legacy). If unavailable, returns null.
const fetchUVIndex = async (lat, lng) => {
  try {
    // Some regions/accounts may still allow this legacy endpoint
    const { data } = await axios.get('https://api.openweathermap.org/data/2.5/uvi', {
      params: { lat, lon: lng, appid: WEATHER_API_KEY },
      timeout: 4000,
    });
    return typeof data?.value === 'number' ? data.value : null;
  } catch (e) {
    return null;
  }
};

// Helper function to fetch weather data from OpenWeather API (Free plan endpoints)
const fetchWeatherFromAPI = async (lat, lng, units = 'imperial') => {
  try {
    // Use free endpoints directly for free plan
    logger.info('Using free OpenWeather API endpoints');
    const normalized = await fetchWeatherFromV2(lat, lng, units);
    return {
      source: 'v2',
      data: normalized,
    };
  } catch (error) {
    logger.error('Weather API error:', error.response?.data || error.message);
    throw new Error('Failed to fetch weather data');
  }
};

// Free plan: Build a One-Call-like payload using 2.5 /weather and /forecast (3h) endpoints
const fetchWeatherFromV2 = async (lat, lng, units = 'imperial') => {
  const params = { lat, lon: lng, appid: WEATHER_API_KEY, units };
  
  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get('https://api.openweathermap.org/data/2.5/weather', { params }),
      axios.get('https://api.openweathermap.org/data/2.5/forecast', { params }),
    ]);

    const current = currentRes.data;
    const list = forecastRes.data?.list || [];

    // Validate API response
    if (!current || !current.main) {
      throw new Error('Invalid weather data received from API');
    }

  // Normalize "current"
  const normalizedCurrent = {
    dt: current.dt,
    temp: current.main?.temp,
    feels_like: current.main?.feels_like,
    humidity: current.main?.humidity,
    pressure: current.main?.pressure,
    visibility: current.visibility,
    uvi: 0, // will try to enrich below
    wind_speed: current.wind?.speed,
    wind_deg: current.wind?.deg,
    wind_gust: current.wind?.gust,
    weather: current.weather,
  };

  // Normalize hourly from 3h forecast (first 24 hours => 8 entries)
  const hourly = list.slice(0, 8).map((h) => ({
    dt: Math.floor(new Date(h.dt_txt).getTime() / 1000),
    temp: h.main?.temp,
    humidity: h.main?.humidity,
    pressure: h.main?.pressure,
    wind_speed: h.wind?.speed,
    wind_deg: h.wind?.deg,
    weather: h.weather,
    pop: h.pop ?? 0,
    rain: h.rain,
    snow: h.snow,
  }));

  // Approximate daily by grouping forecast by date
  const byDate = new Map();
  list.forEach((h) => {
    const d = new Date(h.dt_txt);
    const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key).push(h);
  });
  const daily = Array.from(byDate.entries()).slice(0, 7).map(([key, arr]) => {
    const temps = arr.map((i) => i.main?.temp).filter((t) => typeof t === 'number');
    const humidity = Math.round(arr.reduce((s, i) => s + (i.main?.humidity || 0), 0) / arr.length);
    const pressure = Math.round(arr.reduce((s, i) => s + (i.main?.pressure || 0), 0) / arr.length);
    const wind_speed = Math.round((arr.reduce((s, i) => s + (i.wind?.speed || 0), 0) / arr.length) * 10) / 10;
    const aWeather = arr.find((i) => i.weather && i.weather.length)?.weather || [];
    const pop = Math.round((arr.reduce((s, i) => s + (i.pop || 0), 0) / arr.length) * 100) / 100;
    const dateTs = Math.floor(new Date(key).getTime() / 1000);
    return {
      dt: dateTs,
      temp: {
        min: Math.min(...temps),
        max: Math.max(...temps),
        day: temps[Math.floor(temps.length / 2)] || temps[0],
        night: temps[0],
        eve: temps[temps.length - 1],
        morn: temps[0],
      },
      humidity,
      pressure,
      wind_speed,
      wind_deg: aWeather?.wind_deg,
      uvi: 0,
      weather: aWeather,
      pop,
    };
  });

  // Try to enrich with AQ and UV (may not be available on free plan)
  try {
    const [airQuality, uvi] = await Promise.all([
      fetchAirQuality(lat, lng).catch(() => null),
      fetchUVIndex(lat, lng).catch(() => null),
    ]);
    if (airQuality) normalizedCurrent.air_quality = airQuality;
    if (typeof uvi === 'number') normalizedCurrent.uvi = uvi;
  } catch (error) {
    logger.warn('Could not fetch air quality or UV data:', error.message);
    // Continue without AQ/UV data
  }

    return {
      lat: Number(lat),
      lon: Number(lng),
      timezone: 'local',
      current: normalizedCurrent,
      hourly,
      daily,
      alerts: [],
    };
  } catch (error) {
    logger.error('Free API fetch error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

// Helper to reverse geocode coordinates to a human-readable place name
const reverseGeocode = async (lat, lng) => {
  try {
    const geoResp = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse`, {
      params: {
        lat,
        lon: lng,
        limit: 1,
        appid: WEATHER_API_KEY,
      },
    });
    const [place] = geoResp.data || [];
    if (place) {
      const parts = [place.name, place.state, place.country].filter(Boolean);
      return parts.join(', ');
    }
  } catch (e) {
    logger.warn('Reverse geocoding failed, falling back to lat,lng');
  }
  return `${lat}, ${lng}`;
};

// Helper function to process weather data
const processWeatherData = (apiPayload, location) => {
  // apiPayload is normalized to One Call-like shape
  const current = apiPayload.current;
  const daily = apiPayload.daily || [];
  const hourly = apiPayload.hourly || [];

  return {
    location: {
      name: location.name,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      },
      country: location.country,
      state: location.state,
      city: location.city
    },
    current: {
      temperature: Math.round(current.temp),
      feelsLike: Math.round(current.feels_like || current.temp),
      humidity: current.humidity,
      pressure: current.pressure,
      visibility: current.visibility ? Math.round(current.visibility / 1000) : null,
      // Clamp UV index to schema max (11) to avoid validation errors
      uvIndex: Math.min(typeof current.uvi === 'number' ? current.uvi : 0, 11),
      windSpeed: current.wind_speed,
      windDirection: current.wind_deg,
      windGust: current.wind_gust,
      condition: {
        main: current.weather?.[0]?.main || 'Unknown',
        description: current.weather?.[0]?.description || 'No description',
        icon: current.weather?.[0]?.icon || '01d'
      },
      airQuality: {
        aqi: current.air_quality?.us_epa_index || null,
        pm25: current.air_quality?.pm2_5 || null,
        pm10: current.air_quality?.pm10 || null,
        o3: current.air_quality?.o3 || null,
        no2: current.air_quality?.no2 || null,
        so2: current.air_quality?.so2 || null,
        co: current.air_quality?.co || null
      },
      timestamp: new Date((current.dt || Date.now() / 1000) * 1000)
    },
    forecast: daily.slice(0, 7).map(day => ({
      date: new Date(day.dt * 1000),
      temperature: {
        min: Math.round((day.temp?.min ?? day.temp?.day ?? day.temp) || 0),
        max: Math.round((day.temp?.max ?? day.temp?.day ?? day.temp) || 0),
        day: Math.round((day.temp?.day ?? day.temp) || 0),
        night: Math.round((day.temp?.night ?? day.temp) || 0),
        eve: Math.round((day.temp?.eve ?? day.temp) || 0),
        morn: Math.round((day.temp?.morn ?? day.temp) || 0)
      },
      humidity: day.humidity,
      pressure: day.pressure,
      windSpeed: day.wind_speed,
      windDirection: day.wind_deg,
      uvIndex: day.uvi || 0,
      condition: {
        main: day.weather?.[0]?.main,
        description: day.weather?.[0]?.description,
        icon: day.weather?.[0]?.icon
      },
      precipitation: {
        probability: Math.round((day.pop || 0) * 100),
        amount: day.rain?.['1h'] || day.snow?.['1h'] || 0
      },
      airQuality: {
        aqi: day.air_quality?.us_epa_index || null,
        pm25: day.air_quality?.pm2_5 || null,
        pm10: day.air_quality?.pm10 || null
      }
    })),
    hourly: hourly.slice(0, 24).map(hour => ({
      time: new Date(hour.dt * 1000),
      temperature: Math.round(hour.temp),
      humidity: hour.humidity,
      pressure: hour.pressure,
      windSpeed: hour.wind_speed,
      windDirection: hour.wind_deg,
      condition: {
        main: hour.weather?.[0]?.main,
        description: hour.weather?.[0]?.description,
        icon: hour.weather?.[0]?.icon
      },
      precipitation: {
        probability: Math.round((hour.pop || 0) * 100),
        amount: hour.rain?.['1h'] || hour.snow?.['1h'] || 0
      }
    })),
    alerts: apiPayload.alerts?.map(alert => ({
      type: alert.sender_name.toLowerCase().includes('warning') ? 'severe' : 'moderate',
      title: alert.event,
      description: alert.description,
      startTime: new Date(alert.start * 1000),
      endTime: new Date(alert.end * 1000)
    })) || [],
    source: 'openweather',
    lastUpdated: new Date(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  };
};

// @route   GET /api/weather/current
// @desc    Get current weather for location
// @access  Public
router.get('/current', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, units = 'imperial' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Check if we have fresh data in database
    const existingData = await WeatherData.findOne({
      'location.coordinates.lat': parseFloat(lat),
      'location.coordinates.lng': parseFloat(lng),
      expiresAt: { $gt: new Date() }
    });

    if (existingData && existingData.isFresh()) {
      return res.json({
        success: true,
        data: existingData.getCurrentConditions()
      });
    }

    // Fetch from API (One Call or fallback)
    const api = await fetchWeatherFromAPI(lat, lng, units);

    // Reverse geocode for display name
    const displayName = await reverseGeocode(lat, lng);
    const location = {
      name: displayName,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    const normalizedPayload = api.source === 'onecall' ? api.data : api.data;
    const weatherData = processWeatherData(normalizedPayload, location);

    // Save to database
    const savedData = await WeatherData.create(weatherData);

    const conditions = savedData.getCurrentConditions();
    res.json({
      success: true,
      data: { ...conditions, locationName: savedData.location.name }
    });
  } catch (error) {
    logger.error('Get current weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data'
    });
  }
});

// @route   GET /api/weather/forecast
// @desc    Get weather forecast
// @access  Public
router.get('/forecast', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, days = 7, units = 'imperial' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Check if we have fresh data in database
    const existingData = await WeatherData.findOne({
      'location.coordinates.lat': parseFloat(lat),
      'location.coordinates.lng': parseFloat(lng),
      expiresAt: { $gt: new Date() }
    });

    if (existingData && existingData.isFresh()) {
      return res.json({
        success: true,
        data: existingData.forecast.slice(0, parseInt(days))
      });
    }

    // Fetch from API
    const apiData = await fetchWeatherFromAPI(lat, lng, units);
    
    const location = {
      name: `${lat}, ${lng}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    const weatherData = processWeatherData(apiData, location);

    // Save to database
    const savedData = await WeatherData.create(weatherData);

    res.json({
      success: true,
      data: savedData.forecast.slice(0, parseInt(days))
    });
  } catch (error) {
    logger.error('Get forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch forecast data'
    });
  }
});

// @route   GET /api/weather/hourly
// @desc    Get hourly weather forecast
// @access  Public
router.get('/hourly', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, hours = 24, units = 'imperial' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Check if we have fresh data in database
    const existingData = await WeatherData.findOne({
      'location.coordinates.lat': parseFloat(lat),
      'location.coordinates.lng': parseFloat(lng),
      expiresAt: { $gt: new Date() }
    });

    if (existingData && existingData.isFresh()) {
      return res.json({
        success: true,
        data: existingData.hourly.slice(0, parseInt(hours))
      });
    }

    // Fetch from API
    const apiData = await fetchWeatherFromAPI(lat, lng, units);
    
    const location = {
      name: `${lat}, ${lng}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    const weatherData = processWeatherData(apiData, location);

    // Save to database
    const savedData = await WeatherData.create(weatherData);

    res.json({
      success: true,
      data: savedData.hourly.slice(0, parseInt(hours))
    });
  } catch (error) {
    logger.error('Get hourly weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hourly data'
    });
  }
});

// @route   GET /api/weather/alerts
// @desc    Get weather alerts for location
// @access  Public
router.get('/alerts', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Check if we have fresh data in database
    const existingData = await WeatherData.findOne({
      'location.coordinates.lat': parseFloat(lat),
      'location.coordinates.lng': parseFloat(lng),
      expiresAt: { $gt: new Date() }
    });

    if (existingData && existingData.isFresh()) {
      return res.json({
        success: true,
        data: existingData.alerts
      });
    }

    // Fetch from API
    const apiData = await fetchWeatherFromAPI(lat, lng);
    
    const location = {
      name: `${lat}, ${lng}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    const weatherData = processWeatherData(apiData, location);

    // Save to database
    const savedData = await WeatherData.create(weatherData);

    res.json({
      success: true,
      data: savedData.alerts
    });
  } catch (error) {
    logger.error('Get weather alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather alerts'
    });
  }
});

// @route   GET /api/weather/reverse-geocode
// @desc    Get location name from coordinates
// @access  Public
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const locationName = await reverseGeocode(lat, lng);
    
    res.json({
      success: true,
      data: {
        locationName: locationName || `${lat}, ${lng}`
      }
    });
  } catch (error) {
    logger.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location name'
    });
  }
});

module.exports = router;
