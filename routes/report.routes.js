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
    
    // All users can only see their own data
    where.userId = req.user.id;
    
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
    
    // All users can only see their own data
    where.userId = req.user.id;
    
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
    
    // All users can only see their own data
    taskWhere.userId = req.user.id;
    leaveWhere.userId = req.user.id;
    
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

// @route   GET /api/reports/breakdown
// @desc    Get breakdown report
// @access  Private (Admin, Supervisor, SystemAdmin)
router.get('/breakdown', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    let where = {};
    
    // All users can only see their own data
    where.userId = req.user.id;
    
    const { 
      startDate, 
      endDate, 
      timeRange, 
      userId, 
      source, 
      category, 
      subCategory, 
      incident, 
      office, 
      userInformation, 
      obligation, 
      format 
    } = req.query;
    
    // Apply date filter (only if not empty strings)
    if (startDate && startDate.trim() !== '') {
      where.date = { ...where.date, [Op.gte]: new Date(startDate) };
    }
    if (endDate && endDate.trim() !== '') {
      where.date = { ...where.date, [Op.lte]: new Date(endDate) };
    }
    
    // Apply time range filter (only if no specific start/end dates are provided and timeRange is not empty)
    if (timeRange && timeRange.trim() !== '' && !startDate && !endDate) {
      const now = new Date();
      if (timeRange === 'Weekly') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        where.date = { ...where.date, [Op.gte]: startOfWeek };
      } else if (timeRange === 'Monthly') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        where.date = { ...where.date, [Op.gte]: startOfMonth };
      } else if (timeRange === 'Yearly') {
        const startOfYear = new Date(now.getFullYear() - 1, 0, 1);
        where.date = { ...where.date, [Op.gte]: startOfYear };
      }
    }
    
    // Apply user filter (only if not empty)
    if (userId && userId.trim() !== '') where.userId = userId;
    
    // Apply source filter (only if not empty)
    if (source && source.trim() !== '') where.source = source;
    
    // Apply category filter (only if not empty)
    if (category && category.trim() !== '') where.category = category;
    
    // Apply sub-category filter (only if not empty)
    if (subCategory && subCategory.trim() !== '') where.subCategory = subCategory;
    
    // Apply incident filter (only if not empty)
    if (incident && incident.trim() !== '') where.incident = incident;
    
    // Apply office filter
    // If an office filter is explicitly provided (and not empty), use it instead of the role-based restriction
    if (office && office.trim() !== '') {
      where.office = office;
    } else if (req.user.role === 'Supervisor') {
      // Only apply the role-based office filter if no specific office filter is provided
      where.office = req.user.office;
    }
    // Admin and SystemAdmin can see all offices (no filter needed)
    
    // Apply user information filter (partial match)
    if (userInformation && userInformation.trim() !== '') {
      where.userInformation = { [Op.like]: `%${userInformation}%` };
    }
    
    // Apply obligation filter
    if (obligation && obligation.trim() !== '') where.obligation = obligation;
    
    const tasks = await Task.findAll({ 
      where,
      order: [['date', 'DESC']]
    });
    
    // Handle export formats
    if (format) {
      return handleExport(res, tasks, 'breakdown', format);
    }
    
    res.json(tasks);
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
  } else if (reportType === 'breakdown' && data.length > 0) {
    // Define headers for breakdown report
    const headers = ['Date', 'Source', 'Category', 'Sub-Category', 'Incident', 'User', 'Office', 'User Information', 'Obligation', 'Status'];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const itemData = item.toJSON ? item.toJSON() : item;
      const values = [
        itemData.date ? new Date(itemData.date).toLocaleDateString() : 'N/A',
        itemData.source || 'N/A',
        itemData.category || 'N/A',
        itemData.subCategory || 'N/A',
        itemData.incident || 'N/A',
        itemData.userName || 'N/A',
        itemData.office || 'N/A',
        itemData.userInformation || 'N/A',
        itemData.obligation || 'N/A',
        itemData.status || 'N/A'
      ];
      
      // Escape commas and quotes in values
      const escapedValues = values.map(value => {
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += escapedValues.join(',') + '\n';
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
  
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.csv"`);
  res.status(200).send(Buffer.from(csvContent, 'utf-8'));
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
  } else if (reportType === 'breakdown' && data.length > 0) {
    // Define headers for breakdown report
    const headers = ['Date', 'Source', 'Category', 'Sub-Category', 'Incident', 'User', 'Office', 'User Information', 'Obligation', 'Status'];
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(item => {
      const itemData = item.toJSON ? item.toJSON() : item;
      const values = [
        itemData.date ? new Date(itemData.date).toLocaleDateString() : 'N/A',
        itemData.source || 'N/A',
        itemData.category || 'N/A',
        itemData.subCategory || 'N/A',
        itemData.incident || 'N/A',
        itemData.userName || 'N/A',
        itemData.office || 'N/A',
        itemData.userInformation || 'N/A',
        itemData.obligation || 'N/A',
        itemData.status || 'N/A'
      ];
      
      // Escape commas and quotes in values
      const escapedValues = values.map(value => {
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvContent += escapedValues.join(',') + '\n';
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
  
  res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.xlsx"`);
  res.status(200).send(Buffer.from(csvContent, 'utf-8'));
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
  } else if (reportType === 'breakdown') {
    pdfContent += 'Breakdown Report:\n';
    pdfContent += 'Date,Source,Category,Sub-Category,Incident,User,Office,User Information,Obligation,Status\n';
    data.forEach((item, index) => {
      const itemData = item.toJSON ? item.toJSON() : item;
      pdfContent += `${index + 1}. Date: ${itemData.date ? new Date(itemData.date).toLocaleDateString() : 'N/A'}\n`;
      pdfContent += `   Source: ${itemData.source || 'N/A'}\n`;
      pdfContent += `   Category: ${itemData.category || 'N/A'}\n`;
      pdfContent += `   Sub-Category: ${itemData.subCategory || 'N/A'}\n`;
      pdfContent += `   Incident: ${itemData.incident || 'N/A'}\n`;
      pdfContent += `   User: ${itemData.userName || 'N/A'}\n`;
      pdfContent += `   Office: ${itemData.office || 'N/A'}\n`;
      pdfContent += `   User Information: ${itemData.userInformation || 'N/A'}\n`;
      pdfContent += `   Obligation: ${itemData.obligation || 'N/A'}\n`;
      pdfContent += `   Status: ${itemData.status || 'N/A'}\n\n`;
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