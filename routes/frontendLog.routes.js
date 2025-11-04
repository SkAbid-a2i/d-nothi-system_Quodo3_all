const express = require('express');
const router = express.Router();
const logger = require('../services/logger.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for frontend logs
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

// Receive frontend logs
router.post('/frontend', (req, res) => {
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

// Get frontend logs (SystemAdmin only)
router.get('/frontend', cors(corsOptions), authenticate, authorize('SystemAdmin'), (req, res) => {
  try {
    const { date } = req.query;
    const logs = logger.getFrontendLogs(date);
    
    res.json({
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching frontend logs:', error);
    res.status(500).json({ message: 'Error fetching frontend logs' });
  }
});

// Get all logs (backend + frontend) (SystemAdmin only)
router.get('/all', cors(corsOptions), authenticate, authorize('SystemAdmin'), (req, res) => {
  try {
    const { date } = req.query;
    const logs = logger.getAllLogs(date);
    
    res.json({
      logs: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error fetching all logs:', error);
    res.status(500).json({ message: 'Error fetching all logs' });
  }
});

module.exports = router;