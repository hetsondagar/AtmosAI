const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  preferences: {
    temperatureUnit: {
      type: String,
      enum: ['fahrenheit', 'celsius'],
      default: 'fahrenheit'
    },
    windSpeedUnit: {
      type: String,
      enum: ['mph', 'kmh', 'ms'],
      default: 'mph'
    },
    pressureUnit: {
      type: String,
      enum: ['inHg', 'hPa', 'mb'],
      default: 'inHg'
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      weatherAlerts: { type: Boolean, default: true },
      dailyForecast: { type: Boolean, default: true },
      healthTips: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true }
    },
    voice: {
      enabled: { type: Boolean, default: true },
      volume: { type: Number, default: 75, min: 0, max: 100 },
      wakeWord: { type: String, default: 'Hey AtmosAI' }
    },
    location: {
      autoDetect: { type: Boolean, default: true },
      defaultLocation: { type: String, default: 'San Francisco, CA' },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    health: {
      tipsEnabled: { type: Boolean, default: true },
      uvReminders: { type: Boolean, default: true },
      airQualityAlerts: { type: Boolean, default: true },
      activitySuggestions: { type: Boolean, default: true }
    },
    advanced: {
      backgroundAnimations: { type: Boolean, default: true },
      reducedMotion: { type: Boolean, default: false },
      dataUsage: {
        type: String,
        enum: ['minimal', 'standard', 'unlimited'],
        default: 'standard'
      }
    }
  },
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update streak method
userSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = new Date(this.streak.lastActivity);
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.streak.current += 1;
    this.streak.longest = Math.max(this.streak.longest, this.streak.current);
  } else if (daysDiff > 1) {
    // Streak broken
    this.streak.current = 1;
  }
  
  this.streak.lastActivity = today;
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
