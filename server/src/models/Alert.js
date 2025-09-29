const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['severe', 'moderate', 'info'],
    required: true
  },
  category: {
    type: String,
    enum: ['weather', 'air-quality', 'uv', 'temperature', 'wind', 'precipitation'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    name: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    },
    radius: Number // in kilometers
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  precautions: [{
    type: String,
    required: true
  }],
  severity: {
    level: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    description: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    enum: ['nws', 'openweather', 'ai-generated', 'user-reported'],
    default: 'openweather'
  },
  externalId: String, // ID from external weather service
  affectedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notifications: {
    sent: { type: Boolean, default: false },
    sentAt: Date,
    channels: [{
      type: String,
      enum: ['email', 'push', 'sms']
    }]
  },
  metadata: {
    confidence: Number, // AI confidence score
    aiGenerated: { type: Boolean, default: false },
    tags: [String],
    relatedAlerts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alert'
    }]
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
alertSchema.index({ location: '2dsphere' });
alertSchema.index({ startTime: 1, endTime: 1 });
alertSchema.index({ type: 1, category: 1 });
alertSchema.index({ isActive: 1, startTime: 1 });

// Virtual for duration
alertSchema.virtual('duration').get(function() {
  if (!this.endTime) return null;
  return this.endTime - this.startTime;
});

// Method to check if alert is currently active
alertSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         this.startTime <= now && 
         (!this.endTime || this.endTime >= now);
};

// Method to check if location is within alert radius
alertSchema.methods.isLocationAffected = function(lat, lng) {
  if (!this.location.coordinates || !this.location.radius) return true;
  
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat - this.location.coordinates.lat) * Math.PI / 180;
  const dLng = (lng - this.location.coordinates.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.location.coordinates.lat * Math.PI / 180) * 
            Math.cos(lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance <= this.location.radius;
};

module.exports = mongoose.model('Alert', alertSchema);
