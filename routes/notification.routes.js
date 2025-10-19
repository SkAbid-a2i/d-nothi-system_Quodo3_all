const express = require('express');
const router = express.Router();
const notificationService = require('../services/notification.service');
const { authenticate: authenticateToken } = require('../middleware/auth.middleware');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
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
router.put('/:id/read', authenticateToken, async (req, res) => {
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
router.delete('/clear', authenticateToken, async (req, res) => {
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