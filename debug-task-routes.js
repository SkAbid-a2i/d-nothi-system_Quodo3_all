// Debug version of task routes with detailed error logging
const express = require('express');
const Task = require('../models/Task');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get tasks (Agent: own tasks, Admin/Supervisor: team tasks)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('DEBUG: Task GET request received');
    console.log('DEBUG: User:', req.user);
    
    let where = {};
    
    // Agents can only see their own tasks
    if (req.user.role === 'Agent') {
      where.userId = req.user.id;
    } 
    // Admins and Supervisors can see their team's tasks
    else if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where.office = req.user.office;
    }
    // SystemAdmin can see all tasks
    
    console.log('DEBUG: Query conditions:', where);
    
    // Try to fetch tasks
    console.log('DEBUG: Attempting to fetch tasks...');
    const tasks = await Task.findAll({ where, order: [['createdAt', 'DESC']] });
    console.log('DEBUG: Tasks fetched successfully:', tasks.length);
    
    res.json(tasks);
  } catch (err) {
    console.error('DEBUG: Error in task GET route:', err);
    console.error('DEBUG: Error stack:', err.stack);
    
    // Provide more detailed error information
    if (err.parent) {
      console.error('DEBUG: Parent error:', err.parent);
    }
    if (err.original) {
      console.error('DEBUG: Original error:', err.original);
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: err.message,
      // Don't expose this in production, but useful for debugging
      debug: {
        name: err.name,
        code: err.parent?.code,
        errno: err.parent?.errno,
        sqlState: err.parent?.sqlState
      }
    });
  }
});

module.exports = router;