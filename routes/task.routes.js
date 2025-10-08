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
      // Check if office exists before filtering
      if (req.user.office) {
        where.office = req.user.office;
      }
    }
    // SystemAdmin can see all tasks (no filter needed)
    
    const tasks = await Task.findAll({ 
      where, 
      order: [['createdAt', 'DESC']],
      // Add error handling for database issues
      logging: false // Reduce noise in logs
    });
    
    // Ensure we return an array
    const taskArray = Array.isArray(tasks) ? tasks : tasks ? [tasks] : [];
    res.json(taskArray);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    // More detailed error response
    res.status(500).json({ 
      message: 'Server error while fetching tasks', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private (Agent, Admin, Supervisor)
router.post('/', authenticate, authorize('Agent', 'Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { date, source, category, service, userInformation, description, status = 'Pending', flag = 'None', files = [] } = req.body;

    // Validate required fields
    if (!date || !description) {
      return res.status(400).json({ message: 'Date and description are required' });
    }
    
    // Create new task with proper validation
    const taskData = {
      date: new Date(date),
      source: source || '',
      category: category || '',
      service: service || '',
      userInformation: userInformation || '',
      description: description || '',
      status: status || 'Pending',
      flag: flag || 'None',
      files: Array.isArray(files) ? files : [],
      userId: req.user.id,
      userName: req.user.fullName || req.user.username,
      office: req.user.office || null
    };

    const task = await Task.create(taskData);

    // Notify about task creation
    notificationService.notifyTaskCreated(task);

    res.status(201).json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    // Check if it's a validation error
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: err.errors.map(e => e.message) 
      });
    }
    // Check for database connection errors
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
      return res.status(503).json({ 
        message: 'Database connection failed', 
        error: 'Service temporarily unavailable' 
      });
    }
    res.status(500).json({ 
      message: 'Server error while creating task', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Owner, Admin, Supervisor)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, source, category, service, userInformation, description, status, flag, comments = [], attachments = [], files = [] } = req.body;

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
      if (task.office && task.office !== req.user.office) {
        return res.status(403).json({ message: 'Access denied - Admins can only modify tasks from their office' });
      }
    } else if (task.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied - You can only modify your own tasks' });
    }

    // Update task with validation
    const updateData = {
      date: date ? new Date(date) : task.date,
      source: source !== undefined ? source : task.source,
      category: category !== undefined ? category : task.category,
      service: service !== undefined ? service : task.service,
      userInformation: userInformation !== undefined ? userInformation : task.userInformation,
      description: description || task.description,
      status: status || task.status,
      flag: flag || task.flag,
      comments: Array.isArray(comments) ? comments : task.comments,
      attachments: Array.isArray(attachments) ? attachments : task.attachments,
      files: Array.isArray(files) ? files : task.files,
      userId: req.user.id, // Ensure userId is maintained
      userName: req.user.fullName || req.user.username, // Ensure userName is maintained
      office: req.user.office || task.office // Ensure office is maintained
    };

    const updatedTask = await task.update(updateData);

    // Notify about task update
    notificationService.notifyTaskUpdated(updatedTask);

    res.json(updatedTask);
  } catch (err) {
    console.error('Error updating task:', err);
    // Check if it's a validation error
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: err.errors.map(e => e.message) 
      });
    }
    // Check for database connection errors
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
      return res.status(503).json({ 
        message: 'Database connection failed', 
        error: 'Service temporarily unavailable' 
      });
    }
    res.status(500).json({ 
      message: 'Server error while updating task', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
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
      if (task.office && task.office !== req.user.office) {
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
    // Check for database connection errors
    if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
      return res.status(503).json({ 
        message: 'Database connection failed', 
        error: 'Service temporarily unavailable' 
      });
    }
    res.status(500).json({ 
      message: 'Server error while deleting task', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

module.exports = router;