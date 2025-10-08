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
    // SystemAdmin can see all tasks (no filter needed)
    
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
    const { date, source, category, service, userInformation, description, status = 'Pending', files = [] } = req.body;

    // Debug user info
    console.log('User info:', {
      id: req.user.id,
      fullName: req.user.fullName,
      office: req.user.office
    });
    
    // Create new task
    const task = await Task.create({
      date,
      source,
      category,
      service,
      userInformation,
      description,
      status,
      files,
      userId: req.user.id,
      userName: req.user.fullName,
      office: req.user.office || null
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
    const { date, source, category, service, userInformation, description, status, comments = [], attachments = [], files = [] } = req.body;

    // Check if task exists
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check permissions
    // SystemAdmin can modify any task
    // Admins can modify any task in their office
    // Users can modify their own tasks
    if (req.user.role === 'SystemAdmin') {
      // SystemAdmin can modify any task - no additional checks needed
    } else if (req.user.role === 'Admin') {
      // Admins can modify any task in their office
      if (task.office !== req.user.office) {
        return res.status(403).json({ message: 'Access denied - Admins can only modify tasks from their office' });
      }
    } else if (task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied - You can only modify your own tasks' });
    }

    // Update task
    task.date = date || task.date;
    task.source = source || task.source;
    task.category = category || task.category;
    task.service = service || task.service;
    task.userInformation = userInformation || task.userInformation;
    task.description = description || task.description;
    task.status = status || task.status;
    task.comments = comments;
    task.attachments = attachments;
    task.files = files;

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
    // SystemAdmin can delete any task
    // Admins can delete any task in their office
    // Users can delete their own tasks
    if (req.user.role === 'SystemAdmin') {
      // SystemAdmin can delete any task - no additional checks needed
    } else if (req.user.role === 'Admin') {
      // Admins can delete any task in their office
      if (task.office !== req.user.office) {
        return res.status(403).json({ message: 'Access denied - Admins can only delete tasks from their office' });
      }
    } else if (task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied - You can only delete your own tasks' });
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