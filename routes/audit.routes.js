const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate: authenticateToken, authorize: authorizeRole } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for audit logs
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

// Get all audit logs (Admin, SystemAdmin, and Supervisor can access)
router.get('/', cors(corsOptions), authenticateToken, authorizeRole(['SystemAdmin', 'Admin', 'Supervisor']), async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, action, resourceType } = req.query;
    
    // Build where clause
    const where = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      logs: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLogs: count
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
});

// Create audit log entry
router.post('/', cors(corsOptions), authenticateToken, async (req, res) => {
  try {
    const { action, resourceType, resourceId, description, ipAddress, userAgent } = req.body;
    
    const auditLog = await AuditLog.create({
      userId: req.user.id,
      userName: req.user.username,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress: ipAddress || req.ip,
      userAgent: userAgent || req.get('User-Agent')
    });
    
    res.status(201).json(auditLog);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ message: 'Error creating audit log' });
  }
});

// Get recent audit logs (Admin, SystemAdmin, and Supervisor can access)
router.get('/recent', cors(corsOptions), authenticateToken, authorizeRole(['SystemAdmin', 'Admin', 'Supervisor']), async (req, res) => {
  try {
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
    console.error('Error fetching recent audit logs:', error);
    res.status(500).json({ message: 'Error fetching recent audit logs' });
  }
});

module.exports = router;