const express = require('express');
const sequelize = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for health
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://quodo3-frontend.netlify.app', 
    process.env.FRONTEND_URL_2 || 'http://localhost:3000',
    process.env.FRONTEND_URL_3 || 'https://d-nothi-zenith.vercel.app',
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

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint
// @access  Public
router.get('/', cors(corsOptions), (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Quodo3 API'
  });
});

// @route   GET /api/health/database
// @desc    Database health check endpoint
// @access  Private (SystemAdmin only)
router.get('/database', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
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
router.get('/tasks', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
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