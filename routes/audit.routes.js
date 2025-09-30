const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate: authenticateToken, authorize: authorizeRole } = require('../middleware/auth.middleware');

// Get all audit logs (SystemAdmin only)
router.get('/', authenticateToken, authorizeRole(['SystemAdmin']), async (req, res) => {
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
router.post('/', authenticateToken, async (req, res) => {
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

module.exports = router;