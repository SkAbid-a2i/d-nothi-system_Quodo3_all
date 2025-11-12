const express = require('express');
<<<<<<< HEAD
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
=======
const router = express.Router();
const KanbanBoard = require('../models/KanbanBoard');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all Kanban board items
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const items = await KanbanBoard.findAll({
      where: { userId: req.user.id },
      order: [['position', 'ASC']]
    });
    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching Kanban items:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Kanban items' });
  }
});

// Create a new Kanban board item
router.post('/items', authenticateToken, async (req, res) => {
  try {
    const { title, description, column } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    // Set default column if not provided
    const itemColumn = column || 'backlog';
    
    // Get the next position for this column
    const maxPosition = await KanbanBoard.max('position', {
      where: { column: itemColumn, userId: req.user.id }
    });
    
    const newPosition = maxPosition ? maxPosition + 1 : 0;
    
    const newItem = await KanbanBoard.create({
      title,
      description: description || '',
      column: itemColumn,
      position: newPosition,
      userId: req.user.id,
      userName: req.user.username,
      office: req.user.office || ''
    });
    
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    console.error('Error creating Kanban item:', error);
    res.status(500).json({ success: false, message: 'Failed to create Kanban item' });
  }
});

// Update a Kanban board item
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, column, position } = req.body;
    
    const item = await KanbanBoard.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Kanban item not found' });
    }
    
    // Update the item
    const updatedItem = await item.update({
      title: title || item.title,
      description: description !== undefined ? description : item.description,
      column: column || item.column,
      position: position !== undefined ? position : item.position
    });
    
    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating Kanban item:', error);
    res.status(500).json({ success: false, message: 'Failed to update Kanban item' });
  }
});

// Delete a Kanban board item
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await KanbanBoard.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Kanban item not found' });
    }
    
    await item.destroy();
    
    res.json({ success: true, message: 'Kanban item deleted successfully' });
  } catch (error) {
    console.error('Error deleting Kanban item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete Kanban item' });
  }
});

// Reorder items within a column or move between columns
router.put('/items/:id/reorder', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { column, position } = req.body;
    
    const item = await KanbanBoard.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Kanban item not found' });
    }
    
    // Update the item's column and position
    await item.update({ column, position });
    
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('Error reordering Kanban item:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder Kanban item' });
>>>>>>> 5adfb133814a9ac7a0c035ff22f8e4ea011964f4
  }
});

module.exports = router;