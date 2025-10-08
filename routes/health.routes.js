const express = require('express');
const sequelize = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Quodo3 API'
  });
});

// @route   GET /api/health/database
// @desc    Database health check endpoint
// @access  Private (SystemAdmin only)
router.get('/database', authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get database status
    const databaseStatus = {
      connected: true,
      dialect: sequelize.getDialect(),
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database
    };
    
    // Get table info
    const tables = await sequelize.getQueryInterface().showAllSchemas();
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: databaseStatus,
      tables: tables.length
    });
  } catch (err) {
    console.error('Database health check failed:', err);
    res.status(503).json({ 
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Service unavailable'
    });
  }
});

// @route   GET /api/health/tasks
// @desc    Tasks table health check endpoint
// @access  Private (SystemAdmin only)
router.get('/tasks', authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    // Import Task model
    const Task = require('../models/Task');
    
    // Test tasks table access
    const taskCount = await Task.count();
    
    res.status(200).json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      taskCount: taskCount
    });
  } catch (err) {
    console.error('Tasks health check failed:', err);
    res.status(503).json({ 
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Tasks table access failed',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Service unavailable'
    });
  }
});

module.exports = router;