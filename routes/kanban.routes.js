const express = require('express');
const router = express.Router();
const KanbanBoard = require('../models/KanbanBoard');
const authenticateToken = require('../middleware/auth.middleware');

// Get all Kanban board items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const items = await KanbanBoard.findAll({
      where: { userId: req.user.id },
      order: [['position', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching Kanban board items:', error);
    res.status(500).json({ message: 'Error fetching Kanban board items', error: error.message });
  }
});

// Create a new Kanban board item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, column } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Create new item
    const newItem = await KanbanBoard.create({
      title,
      description,
      column: column || 'backlog',
      userId: req.user.id,
      userName: req.user.username,
      office: req.user.office || null
    });
    
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating Kanban board item:', error);
    res.status(500).json({ message: 'Error creating Kanban board item', error: error.message });
  }
});

// Update a Kanban board item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, column, position } = req.body;
    
    // Find the item
    const item = await KanbanBoard.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Kanban board item not found' });
    }
    
    // Update item
    await item.update({
      title,
      description,
      column,
      position
    });
    
    res.json(item);
  } catch (error) {
    console.error('Error updating Kanban board item:', error);
    res.status(500).json({ message: 'Error updating Kanban board item', error: error.message });
  }
});

// Delete a Kanban board item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the item
    const item = await KanbanBoard.findOne({
      where: { id, userId: req.user.id }
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Kanban board item not found' });
    }
    
    // Delete item
    await item.destroy();
    
    res.json({ message: 'Kanban board item deleted successfully' });
  } catch (error) {
    console.error('Error deleting Kanban board item:', error);
    res.status(500).json({ message: 'Error deleting Kanban board item', error: error.message });
  }
});

module.exports = router;
