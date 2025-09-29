const express = require('express');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/events
// @desc    Get user's events
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { date, type, status, limit = 50 } = req.query;
    
    let query = { user: req.user._id };
    
    // Filter by date
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Filter by type
    if (type) {
      query.type = type;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const events = await Event.find(query)
      .sort({ date: 1, time: 1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get specific event
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      type,
      weather,
      location,
      reminders = [],
      tags = [],
      isRecurring = false,
      recurrencePattern
    } = req.body;
    
    const event = await Event.create({
      user: req.user._id,
      title,
      description,
      date: new Date(date),
      time,
      type,
      weather,
      location,
      reminders,
      tags,
      isRecurring,
      recurrencePattern
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('event-created', event);
    }
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('event-updated', event);
    }
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event
    });
  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('event-deleted', { id: req.params.id });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

// @route   GET /api/events/calendar/:year/:month
// @desc    Get events for calendar view
// @access  Private
router.get('/calendar/:year/:month', auth, async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const events = await Event.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1, time: 1 });
    
    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
      const dateKey = event.date.toISOString().split('T')[0];
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    
    res.json({
      success: true,
      data: eventsByDate
    });
  } catch (error) {
    logger.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events'
    });
  }
});

// @route   POST /api/events/:id/check-weather
// @desc    Check weather impact on event
// @access  Private
router.post('/:id/check-weather', auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // This would integrate with weather service
    // For now, return mock data
    const weatherImpact = {
      affected: event.checkWeatherImpact({
        condition: 'rainy',
        temperature: 45,
        humidity: 80
      }),
      suggestion: event.weather === 'sunny' ? 'Consider rescheduling for better weather' : 'Weather looks good for your event',
      alternativeDate: event.weather === 'sunny' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null
    };
    
    // Update event with weather impact
    event.weatherImpact = weatherImpact;
    await event.save();
    
    res.json({
      success: true,
      data: weatherImpact
    });
  } catch (error) {
    logger.error('Check weather impact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check weather impact'
    });
  }
});

module.exports = router;
