const express = require('express');
const Task = require('../models/Task');
const Leave = require('../models/Leave');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');
const cors = require('cors');

// CORS configuration for reports
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

// @route   GET /api/reports/tasks
// @desc    Get task report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/tasks', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let where = {};
    
    // Admins and Supervisors can only see their team's tasks
    if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where.office = req.user.office;
    }
    
    const { startDate, endDate, userId, status, format } = req.query;
    
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
    
    // Handle export formats
    if (format) {
      return handleExport(res, tasks, 'tasks', format);
    }
    
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/leaves
// @desc    Get leave report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/leaves', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let where = {};
    
    // Admins and Supervisors can only see their team's leaves
    if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where.office = req.user.office;
    }
    
    const { startDate, endDate, userId, status, format } = req.query;
    
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
    
    // Handle export formats
    if (format) {
      return handleExport(res, leaves, 'leaves', format);
    }
    
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/summary
// @desc    Get summary report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/summary', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let taskWhere = {};
    let leaveWhere = {};
    
    // Admins and Supervisors can only see their team's data
    if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      taskWhere.office = req.user.office;
      leaveWhere.office = req.user.office;
    }
    
    const { startDate, endDate, format } = req.query;
    
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
    
    const summary = {
      tasks: taskStats,
      leaves: leaveStats,
      generatedAt: new Date()
    };
    
    // Handle export formats
    if (format) {
      return handleExport(res, summary, 'summary', format);
    }
    
    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to handle exports
const handleExport = (res, data, reportType, format) => {
  switch (format.toLowerCase()) {
    case 'csv':
      return exportAsCSV(res, data, reportType);
    case 'xlsx':
      return exportAsExcel(res, data, reportType);
    case 'pdf':
      return exportAsPDF(res, data, reportType);
    default:
      return res.status(400).json({ message: 'Invalid export format' });
  }
};

// Export as CSV
const exportAsCSV = (res, data, reportType) => {
  let csvContent = '';
  
  // Add headers
  if (reportType === 'tasks' && data.length > 0) {
    const headers = Object.keys(data[0].toJSON());
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        // Escape commas and quotes in values
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });
  } else if (reportType === 'leaves' && data.length > 0) {
    const headers = Object.keys(data[0].toJSON());
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        // Escape commas and quotes in values
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });
  } else if (reportType === 'summary') {
    csvContent += 'Report Type,Generated At\n';
    csvContent += `Summary,${data.generatedAt.toISOString()}\n\n`;
    
    csvContent += 'Task Statistics\n';
    csvContent += 'Status,Count\n';
    data.tasks.forEach(stat => {
      csvContent += `${stat.status},${stat.count}\n`;
    });
    
    csvContent += '\nLeave Statistics\n';
    csvContent += 'Status,Count\n';
    data.leaves.forEach(stat => {
      csvContent += `${stat.status},${stat.count}\n`;
    });
  }
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
  res.status(200).send(csvContent);
};

// Export as Excel (simplified - in a real implementation, you'd use a library like xlsx)
const exportAsExcel = (res, data, reportType) => {
  // For demonstration purposes, we'll return CSV with Excel extension
  // In a real implementation, you would use a library like xlsx to generate proper Excel files
  let csvContent = '';
  
  if (reportType === 'tasks' && data.length > 0) {
    const headers = Object.keys(data[0].toJSON());
    csvContent += headers.join(',') + '\n';
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });
  } else if (reportType === 'leaves' && data.length > 0) {
    const headers = Object.keys(data[0].toJSON());
    csvContent += headers.join(',') + '\n';
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += values.join(',') + '\n';
    });
  } else if (reportType === 'summary') {
    csvContent += 'Report Type,Generated At\n';
    csvContent += `Summary,${data.generatedAt.toISOString()}\n\n`;
    
    csvContent += 'Task Statistics\n';
    csvContent += 'Status,Count\n';
    data.tasks.forEach(stat => {
      csvContent += `${stat.status},${stat.count}\n`;
    });
    
    csvContent += '\nLeave Statistics\n';
    csvContent += 'Status,Count\n';
    data.leaves.forEach(stat => {
      csvContent += `${stat.status},${stat.count}\n`;
    });
  }
  
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.xlsx"`);
  res.status(200).send(csvContent);
};

// Export as PDF (simplified - in a real implementation, you'd use a library like pdfkit)
const exportAsPDF = (res, data, reportType) => {
  // For demonstration purposes, we'll return a simple text representation
  // In a real implementation, you would use a library like pdfkit to generate proper PDF files
  let pdfContent = `Report: ${reportType}\n`;
  pdfContent += `Generated: ${new Date().toISOString()}\n\n`;
  
  if (reportType === 'tasks') {
    pdfContent += 'Tasks:\n';
    data.forEach((item, index) => {
      pdfContent += `${index + 1}. ${item.description || 'No description'}\n`;
      pdfContent += `   Date: ${item.date}\n`;
      pdfContent += `   Status: ${item.status}\n\n`;
    });
  } else if (reportType === 'leaves') {
    pdfContent += 'Leaves:\n';
    data.forEach((item, index) => {
      pdfContent += `${index + 1}. ${item.userName}\n`;
      pdfContent += `   Dates: ${item.startDate} to ${item.endDate}\n`;
      pdfContent += `   Status: ${item.status}\n\n`;
    });
  } else if (reportType === 'summary') {
    pdfContent += 'Summary Report\n\n';
    
    pdfContent += 'Task Statistics:\n';
    data.tasks.forEach(stat => {
      pdfContent += `  ${stat.status}: ${stat.count}\n`;
    });
    
    pdfContent += '\nLeave Statistics:\n';
    data.leaves.forEach(stat => {
      pdfContent += `  ${stat.status}: ${stat.count}\n`;
    });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.pdf"`);
  res.status(200).send(pdfContent);
};

module.exports = router;