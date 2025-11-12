const express = require('express');
const Kanban = require('../models/Kanban');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const cors = require('cors');

// CORS configuration for kanban
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

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`Kanban route accessed: ${req.method} ${req.url}`);
  next();
});

// Add a test route to verify the routes are working
router.get('/test', (req, res) => {
  console.log('Kanban test route accessed');
  res.json({ message: 'Kanban routes are working' });
});

// @route   GET /api/kanban
// @desc    Get all kanban items
// @access  Private
router.get('/', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Fetching kanban items for user:', req.user);
    let where = {};
    
    // All users can see their own kanban items
    where = {
      createdBy: req.user.id
    };

    const kanbanItems = await Kanban.findAll({ 
      where, 
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });
    
    console.log('Found kanban items:', kanbanItems.length);
    res.json({ data: kanbanItems });
  } catch (err) {
    console.error('Error fetching kanban items:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/kanban
// @desc    Create new kanban item
// @access  Private
router.post('/', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Creating kanban item for user:', req.user);
    console.log('Request body:', req.body);
    const { title, description, status } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create new kanban item
    const kanbanItem = await Kanban.create({
      title,
      description,
      status: status || 'Backlog',
      createdBy: req.user.id
    });

    console.log('Created kanban item:', kanbanItem.id);
    // Send notification about kanban item creation
    notificationService.notifyKanbanItemCreated(kanbanItem);

    // Reload kanban item with associations
    const fullKanbanItem = await Kanban.findByPk(kanbanItem.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.status(201).json({ data: fullKanbanItem });
  } catch (err) {
    console.error('Error creating kanban item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/kanban/:id
// @desc    Update kanban item
// @access  Private (Owner only)
router.put('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Updating kanban item:', req.params.id, 'for user:', req.user);
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Check if kanban item exists
    const kanbanItem = await Kanban.findByPk(id);
    if (!kanbanItem) {
      return res.status(404).json({ message: 'Kanban item not found' });
    }

    // Check permissions - only creator can update
    if (kanbanItem.createdBy !== req.user.id && req.user.role !== 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - You can only update your own kanban items' });
    }

    // Update kanban item
    kanbanItem.title = title || kanbanItem.title;
    kanbanItem.description = description || kanbanItem.description;
    kanbanItem.status = status || kanbanItem.status;

    await kanbanItem.save();

    // Create audit log for kanban item update
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'UPDATE',
        resourceType: 'KANBAN',
        resourceId: kanbanItem.id,
        description: `Kanban item "${kanbanItem.title}" updated by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for kanban item update:', auditError);
    }

    // Send notification about kanban item update
    notificationService.notifyKanbanItemUpdated(kanbanItem);

    // Reload kanban item with associations
    const fullKanbanItem = await Kanban.findByPk(kanbanItem.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.json({ data: fullKanbanItem });
  } catch (err) {
    console.error('Error updating kanban item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/kanban/:id
// @desc    Delete kanban item
// @access  Private (Owner only)
router.delete('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Deleting kanban item:', req.params.id, 'for user:', req.user);
    const { id } = req.params;

    // Check if kanban item exists
    const kanbanItem = await Kanban.findByPk(id);
    if (!kanbanItem) {
      return res.status(404).json({ message: 'Kanban item not found' });
    }

    // Check permissions - only creator can delete
    if (kanbanItem.createdBy !== req.user.id && req.user.role !== 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - You can only delete your own kanban items' });
    }

    // Delete kanban item
    await kanbanItem.destroy();

    // Create audit log for kanban item deletion
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'DELETE',
        resourceType: 'KANBAN',
        resourceId: kanbanItem.id,
        description: `Kanban item "${kanbanItem.title}" deleted by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for kanban item deletion:', auditError);
    }

    // Send notification about kanban item deletion
    notificationService.notifyKanbanItemDeleted(kanbanItem);

    res.json({ message: 'Kanban item removed' });
  } catch (err) {
    console.error('Error deleting kanban item:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;