const express = require('express');
const router = express.Router();
const logger = require('../services/logger.service');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get logs (SystemAdmin only)
router.get('/', authenticate, authorize('SystemAdmin'), (req, res) => {
  try {
    const { date, level } = req.query;
    let logs = [];
    
    if (level === 'error') {
      logs = logger.getErrorLogs(date);
    } else {
      logs = logger.getLogs(date);
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

// Get recent logs (SystemAdmin only)
router.get('/recent', authenticate, authorize('SystemAdmin'), (req, res) => {
  try {
    const logs = logger.getLogs();
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