const express = require('express');
const router = express.Router();
const notificationService = require('../services/notification.service');
const { authenticate: authenticateToken } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for notifications
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://quodo3-frontend.netlify.app', 
    process.env.FRONTEND_URL_2 || 'http://localhost:3000',
    'https://quodo3-frontend.onrender.com',
    'https://quodo3-backend.onrender.com',
    'https://d-nothi-system-quodo3-all.vercel.app',
    'https://d-nothi-system-quodo3-all-git-main-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-l49aqp6te-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-cn53p2hxd-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-bp6mein7b-skabid-5302s-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Get user notifications
router.get('/', cors(corsOptions), authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const notifications = await notificationService.getUserNotifications(req.user.id, parseInt(limit));
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', cors(corsOptions), authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await notificationService.markNotificationAsRead(id, req.user.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Clear all user notifications
router.delete('/clear', cors(corsOptions), authenticateToken, async (req, res) => {
  try {
    const success = await notificationService.clearUserNotifications(req.user.id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Notifications cleared successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to clear notifications'
      });
    }
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications'
    });
  }
});

module.exports = router;