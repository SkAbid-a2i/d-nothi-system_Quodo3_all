const express = require('express');
const router = express.Router();
const logger = require('../services/logger.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get logs (SystemAdmin only)
router.get('/', authenticate, authorize('SystemAdmin'), (req, res) => {
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

// Analyze logs (SystemAdmin only)
router.get('/analyze', authenticate, authorize('SystemAdmin'), (req, res) => {
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
router.get('/recent', authenticate, authorize(['SystemAdmin', 'Admin', 'Supervisor']), (req, res) => {
  try {
    const logs = logger.getAllLogs();
    // Get last 50 logs
    const recentLogs = logs.slice(-50);
    res.json({
      logs: recentLogs,
      count: recentLogs.length
    });
  } catch (error) {
    console.error('Error fetching recent logs:', error);
    res.status(500).json({ message: 'Error fetching recent logs' });
  }
});

module.exports = router;