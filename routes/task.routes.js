const express = require('express');
const Task = require('../models/Task');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

const router = express.Router();

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
    
    const tasks = await Task.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private (Agent, Admin, Supervisor)
router.post('/', authenticate, authorize('Agent', 'Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { date, source, category, service, description, status = 'Pending' } = req.body;

    // Create new task
    const task = await Task.create({
      date,
      source,
      category,
      service,
      description,
      status,
      userId: req.user.id,
      userName: req.user.fullName,
      office: req.user.office
    });

    // Notify about task creation
    notificationService.notifyTaskCreated(task);

    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Owner, Admin, Supervisor)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, source, category, service, description, status, comments = [], attachments = [] } = req.body;

    // Check if task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    if (req.user.role !== 'SystemAdmin' && 
        req.user.role !== 'Admin' && 
        task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update task
    task.date = date || task.date;
    task.source = source || task.source;
    task.category = category || task.category;
    task.service = service || task.service;
    task.description = description || task.description;
    task.status = status || task.status;
    task.comments = comments;
    task.attachments = attachments;

    await task.save();

    // Notify about task update
    notificationService.notifyTaskUpdated(task);

    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
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
    if (req.user.role !== 'SystemAdmin' && 
        req.user.role !== 'Admin' && 
        task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete task
    await task.destroy();

    // Notify about task deletion
    notificationService.notifyTaskUpdated({ ...task, deleted: true });

    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;