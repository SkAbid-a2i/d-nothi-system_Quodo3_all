const express = require('express');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/reports/tasks
// @desc    Get task report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/tasks', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let where = {};
    
    // Admins and Supervisors can only see their team's tasks
    if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where.office = req.user.office;
    }
    
    const { startDate, endDate, userId, status } = req.query;
    
    // Apply date filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }
    
    // Apply user filter
    if (userId) where.userId = userId;
    
    // Apply status filter
    if (status) where.status = status;
    
    const tasks = await Task.findAll({ 
      where,
      order: [['date', 'DESC']]
    });
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/leaves
// @desc    Get leave report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/leaves', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let where = {};
    
    // Admins and Supervisors can only see their team's leaves
    if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where.office = req.user.office;
    }
    
    const { startDate, endDate, userId, status } = req.query;
    
    // Apply date filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }
    
    // Apply user filter
    if (userId) where.userId = userId;
    
    // Apply status filter
    if (status) where.status = status;
    
    const leaves = await Leave.findAll({ 
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/summary
// @desc    Get summary report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/summary', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let taskWhere = {};
    let leaveWhere = {};
    
    // Admins and Supervisors can only see their team's data
    if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      taskWhere.office = req.user.office;
      leaveWhere.office = req.user.office;
    }
    
    const { startDate, endDate } = req.query;
    
    // Apply date filter
    if (startDate || endDate) {
      if (startDate) {
        const start = new Date(startDate);
        taskWhere.date = { ...taskWhere.date, [Op.gte]: start };
        leaveWhere.createdAt = { ...leaveWhere.createdAt, [Op.gte]: start };
      }
      if (endDate) {
        const end = new Date(endDate);
        taskWhere.date = { ...taskWhere.date, [Op.lte]: end };
        leaveWhere.createdAt = { ...leaveWhere.createdAt, [Op.lte]: end };
      }
    }
    
    // Get task statistics
    const taskStats = await Task.findAll({
      where: taskWhere,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });
    
    // Get leave statistics
    const leaveStats = await Leave.findAll({
      where: leaveWhere,
      attributes: [
        'status',
        [require('sequelize').fn('COUNT', require('sequelize').col('status')), 'count']
      ],
      group: ['status']
    });
    
    // Get total users in office (for Admin/Supervisor)
    // We would need to import User model and count users in the office
    // For now, we'll set it to 0 and implement later
    
    res.json({
      tasks: taskStats,
      leaves: leaveStats,
      userCount: 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;