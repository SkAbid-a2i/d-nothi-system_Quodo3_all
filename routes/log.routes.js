const express = require('express');
const router = express.Router();
const logger = require('../services/logger.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for logs
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

// Get logs (SystemAdmin only)
router.get('/', cors(corsOptions), authenticate, authorize('SystemAdmin'), (req, res) => {
  try {
    const { date, level, source } = req.query;
    let logs = [];
    
    if (source === 'frontend') {
      logs = logger.getFrontendLogs(date);
    } else if (source === 'all') {
      logs = logger.getAllLogs(date);
    } else if (level === 'error') {
      logs = logger.getErrorLogs(date);
    } else {
      logs = logger.getLogs(date);
    }
    
    // Filter by level if specified
    if (level && level !== 'error' && source !== 'frontend') {
      logs = logs.filter(log => log.level === level);
    }
    
    res.json({
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Error fetching logs' });
  }
});

// Receive frontend logs
router.post('/frontend', cors(corsOptions), (req, res) => {
  try {
    const logData = req.body;
    
    // Validate log data
    if (!logData.level || !logData.message) {
      return res.status(400).json({ message: 'Invalid log data' });
    }
    
    // Handle the frontend log
    logger.handleFrontendLog(logData);
    
    res.status(200).json({ message: 'Log received successfully' });
  } catch (error) {
    console.error('Error handling frontend log:', error);
    res.status(500).json({ message: 'Error processing log' });
  }
});

// Analyze logs (SystemAdmin only)
router.get('/analyze', cors(corsOptions), authenticate, authorize('SystemAdmin'), (req, res) => {
  try {
    const { hours } = req.query;
    const analysis = logger.analyzeLogs(hours ? parseInt(hours) : 24);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing logs:', error);
    res.status(500).json({ message: 'Error analyzing logs' });
  }
});

// Get recent logs (Admin, SystemAdmin, and Supervisor can access)
router.get('/recent', cors(corsOptions), authenticate, authorize(['SystemAdmin', 'Admin', 'Supervisor']), async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    
    // Get last 50 audit logs ordered by creation time
    const logs = await AuditLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json({
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({ message: 'Error fetching recent logs' });
  }
});

module.exports = router;