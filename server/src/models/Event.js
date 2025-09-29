const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['outdoor', 'indoor', 'flexible'],
    required: true
  },
  weather: {
    type: String,
    enum: ['sunny', 'cloudy', 'rainy', 'any'],
    default: 'any'
  },
  location: {
    name: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  weatherImpact: {
    affected: { type: Boolean, default: false },
    suggestion: String,
    alternativeDate: Date
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms']
    },
    time: String, // Time before event (e.g., "1h", "30m")
    sent: { type: Boolean, default: false }
  }],
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number,
    endDate: Date,
    daysOfWeek: [Number] // 0-6 for Sunday-Saturday
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ user: 1, date: 1 });
eventSchema.index({ user: 1, status: 1 });
eventSchema.index({ date: 1, type: 1 });

// Virtual for full datetime
eventSchema.virtual('fullDateTime').get(function() {
  const [hours, minutes] = this.time.split(':');
  const eventDate = new Date(this.date);
  eventDate.setHours(parseInt(hours), parseInt(minutes));
  return eventDate;
});

// Method to check if event is affected by weather
eventSchema.methods.checkWeatherImpact = function(weatherData) {
  if (this.weather === 'any') return false;
  
  const currentCondition = weatherData.condition.toLowerCase();
  const eventWeather = this.weather.toLowerCase();
  
  // Simple weather matching logic
  const weatherMap = {
    'sunny': ['clear', 'sunny'],
    'cloudy': ['cloudy', 'overcast', 'partly cloudy'],
    'rainy': ['rain', 'rainy', 'storm', 'thunderstorm']
  };
  
  return !weatherMap[eventWeather]?.includes(currentCondition);
};

module.exports = mongoose.model('Event', eventSchema);
