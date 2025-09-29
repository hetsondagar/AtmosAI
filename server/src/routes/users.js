const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          avatar: req.user.avatar,
          preferences: req.user.preferences,
          streak: req.user.streak,
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt
        }
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, avatar } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, avatar },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// @route   PUT /api/users/location
// @desc    Update user location
// @access  Private
router.put('/location', auth, async (req, res) => {
  try {
    const { autoDetect, defaultLocation, coordinates } = req.body;
    
    const updateData = {
      'preferences.location.autoDetect': autoDetect,
      'preferences.location.defaultLocation': defaultLocation
    };
    
    if (coordinates) {
      updateData['preferences.location.coordinates'] = coordinates;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: user.preferences.location
      }
    });
  } catch (error) {
    logger.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// @route   POST /api/users/streak
// @desc    Update user streak
// @access  Private
router.post('/streak', auth, async (req, res) => {
  try {
    await req.user.updateStreak();
    
    res.json({
      success: true,
      message: 'Streak updated successfully',
      data: {
        streak: req.user.streak
      }
    });
  } catch (error) {
    logger.error('Update streak error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update streak'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const Event = require('../models/Event');
    const Alert = require('../models/Alert');
    
    // Get event statistics
    const totalEvents = await Event.countDocuments({ user: req.user._id });
    const completedEvents = await Event.countDocuments({ 
      user: req.user._id, 
      status: 'completed' 
    });
    const upcomingEvents = await Event.countDocuments({ 
      user: req.user._id, 
      status: 'scheduled',
      date: { $gte: new Date() }
    });
    
    // Get alert statistics
    const totalAlerts = await Alert.countDocuments({
      affectedUsers: req.user._id
    });
    const activeAlerts = await Alert.countDocuments({
      affectedUsers: req.user._id,
      isActive: true,
      startTime: { $lte: new Date() },
      $or: [
        { endTime: { $exists: false } },
        { endTime: { $gte: new Date() } }
      ]
    });
    
    const stats = {
      events: {
        total: totalEvents,
        completed: completedEvents,
        upcoming: upcomingEvents,
        completionRate: totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0
      },
      alerts: {
        total: totalAlerts,
        active: activeAlerts
      },
      streak: req.user.streak,
      accountAge: Math.floor((new Date() - req.user.createdAt) / (1000 * 60 * 60 * 24))
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }
    
    // Verify password
    const isMatch = await req.user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Delete user and related data
    await User.findByIdAndDelete(req.user._id);
    
    // Delete user's events
    const Event = require('../models/Event');
    await Event.deleteMany({ user: req.user._id });
    
    logger.info(`User account deleted: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;
