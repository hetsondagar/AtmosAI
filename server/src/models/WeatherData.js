const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    country: String,
    state: String,
    city: String
  },
  current: {
    temperature: { type: Number, required: true },
    feelsLike: Number,
    humidity: { type: Number, min: 0, max: 100 },
    pressure: Number,
    visibility: Number,
    uvIndex: { type: Number, min: 0, max: 11 },
    windSpeed: Number,
    windDirection: Number,
    windGust: Number,
    condition: {
      main: String,
      description: String,
      icon: String
    },
    airQuality: {
      aqi: Number,
      pm25: Number,
      pm10: Number,
      o3: Number,
      no2: Number,
      so2: Number,
      co: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  forecast: [{
    date: { type: Date, required: true },
    temperature: {
      min: Number,
      max: Number,
      day: Number,
      night: Number,
      eve: Number,
      morn: Number
    },
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: Number,
    uvIndex: Number,
    condition: {
      main: String,
      description: String,
      icon: String
    },
    precipitation: {
      probability: Number,
      amount: Number
    },
    airQuality: {
      aqi: Number,
      pm25: Number,
      pm10: Number
    }
  }],
  hourly: [{
    time: { type: Date, required: true },
    temperature: Number,
    humidity: Number,
    pressure: Number,
    windSpeed: Number,
    windDirection: Number,
    condition: {
      main: String,
      description: String,
      icon: String
    },
    precipitation: {
      probability: Number,
      amount: Number
    }
  }],
  alerts: [{
    type: String,
    title: String,
    description: String,
    startTime: Date,
    endTime: Date
  }],
  source: {
    type: String,
    enum: ['openweather', 'nws', 'accuweather'],
    default: 'openweather'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  }
}, {
  timestamps: true
});

// Indexes
weatherDataSchema.index({ 'location.coordinates': '2dsphere' });
weatherDataSchema.index({ lastUpdated: 1 });
weatherDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to check if data is still fresh
weatherDataSchema.methods.isFresh = function() {
  return new Date() < this.expiresAt;
};

// Method to get current conditions
weatherDataSchema.methods.getCurrentConditions = function() {
  return {
    temperature: this.current.temperature,
    condition: this.current.condition,
    humidity: this.current.humidity,
    windSpeed: this.current.windSpeed,
    uvIndex: this.current.uvIndex,
    airQuality: this.current.airQuality,
    timestamp: this.current.timestamp
  };
};

// Method to get forecast for specific date
weatherDataSchema.methods.getForecastForDate = function(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return this.forecast.find(day => {
    const forecastDate = new Date(day.date);
    forecastDate.setHours(0, 0, 0, 0);
    return forecastDate.getTime() === targetDate.getTime();
  });
};

module.exports = mongoose.model('WeatherData', weatherDataSchema);
