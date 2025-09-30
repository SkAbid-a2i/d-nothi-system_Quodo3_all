const express = require('express');
const Task = require('../models/Task');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// @route   GET /api/tasks
// @desc    Get tasks (Agent: own tasks, Admin/Supervisor: team tasks)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let where = {};
    
    // Agents can only see their own tasks
    if (req.user.role === 'Agent') {
      where.userId = req.user.id;
    } 
    // Admins and Supervisors can see their team's tasks
    else if (req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      where.office = req.user.office;
    }
    // SystemAdmin can see all tasks
    
    const tasks = await Task.findAll({ where, order: [['date', 'DESC']] });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private (Agent, Admin, Supervisor)
router.post('/', authenticate, authorize('Agent', 'Admin', 'Supervisor'), upload.array('attachments', 5), async (req, res) => {
  try {
    const { date, source, category, service, description, status } = req.body;

    // Create new task
    const task = await Task.create({
      date,
      source,
      category,
      service,
      userId: req.user.id,
      userName: req.user.fullName,
      office: req.user.office,
      description,
      status: status || 'Pending',
    });

    // Add attachments if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        size: file.size,
      }));
      
      task.attachments = attachments;
      await task.save();
    }

    // Log the action
    // TODO: Implement audit logging

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Owner, Admin, Supervisor)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, source, category, service, description, status, comment } = req.body;

    // Check if task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'Agent' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if ((req.user.role === 'Supervisor' || req.user.role === 'Admin') && task.office !== req.user.office) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task fields
    task.date = date || task.date;
    task.source = source || task.source;
    task.category = category || task.category;
    task.service = service || task.service;
    task.description = description || task.description;
    task.status = status || task.status;

    // Add comment if provided
    if (comment) {
      const comments = [...task.comments, {
        text: comment,
        userId: req.user.id,
        userName: req.user.fullName,
        createdAt: new Date()
      }];
      task.comments = comments;
    }

    await task.save();

    // Log the action
    // TODO: Implement audit logging

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Owner, Admin, Supervisor)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role === 'Agent' && task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if ((req.user.role === 'Supervisor' || req.user.role === 'Admin') && task.office !== req.user.office) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.destroy();

    // Log the action
    // TODO: Implement audit logging

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;