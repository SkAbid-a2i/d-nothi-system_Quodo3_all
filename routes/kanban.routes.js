const express = require('express');
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
  }
});

module.exports = router;