const express = require('express');
const Alert = require('../models/Alert');
const { optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for location
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { lat, lng, type, category, active } = req.query;
    
    let query = {};
    
    // Filter by location if provided
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // 50km radius
        }
      };
    }
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by category
    if (category) {
      query.category = category;
    }
    
    // Filter by active status
    if (active !== undefined) {
      if (active === 'true') {
        query.isActive = true;
        query.startTime = { $lte: new Date() };
        query.$or = [
          { endTime: { $exists: false } },
          { endTime: { $gte: new Date() } }
        ];
      } else if (active === 'false') {
        query.$or = [
          { isActive: false },
          { startTime: { $gt: new Date() } },
          { endTime: { $lt: new Date() } }
        ];
      }
    }
    
    const alerts = await Alert.find(query)
      .sort({ startTime: -1 })
      .limit(50);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// @route   GET /api/alerts/:id
// @desc    Get specific alert
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert'
    });
  }
});

// @route   POST /api/alerts
// @desc    Create new alert (admin only)
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      type,
      category,
      title,
      description,
      location,
      startTime,
      endTime,
      precautions,
      severity,
      source = 'ai-generated'
    } = req.body;
    
    const alert = await Alert.create({
      type,
      category,
      title,
      description,
      location,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : undefined,
      precautions,
      severity,
      source
    });
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`location-${location.name}`).emit('new-alert', alert);
    }
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    logger.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert'
    });
  }
});

// @route   PUT /api/alerts/:id
// @desc    Update alert
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`location-${alert.location.name}`).emit('alert-updated', alert);
    }
    
    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    logger.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert'
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Delete alert
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`location-${alert.location.name}`).emit('alert-deleted', { id: req.params.id });
    }
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    logger.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert'
    });
  }
});

// @route   GET /api/alerts/active
// @desc    Get active alerts for location
// @access  Public
router.get('/active', optionalAuth, async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    let query = {
      isActive: true,
      startTime: { $lte: new Date() },
      $or: [
        { endTime: { $exists: false } },
        { endTime: { $gte: new Date() } }
      ]
    };
    
    if (lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: 50000 // 50km radius
        }
      };
    }
    
    const alerts = await Alert.find(query)
      .sort({ severity: -1, startTime: -1 });
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Get active alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active alerts'
    });
  }
});

module.exports = router;
