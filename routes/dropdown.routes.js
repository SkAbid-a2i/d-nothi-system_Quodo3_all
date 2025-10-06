const express = require('express');
const Dropdown = require('../models/Dropdown');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');

const router = express.Router();

// @route   GET /api/dropdowns
// @desc    Get all dropdown values
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const dropdowns = await Dropdown.findAll({ 
      where: { isActive: true },
      order: [['type', 'ASC'], ['value', 'ASC']]
    });
    res.json(dropdowns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dropdowns/:type
// @desc    Get dropdown values by type
// @access  Private
router.get('/:type', authenticate, async (req, res) => {
  try {
    const { type } = req.params;
    const { parentValue } = req.query;

    // Validate type
    if (!['Source', 'Category', 'Service', 'Office'].includes(type)) {
      return res.status(400).json({ message: 'Invalid dropdown type' });
    }

    let where = { type, isActive: true };
    
    // For services, filter by parent category if provided
    if (type === 'Service' && parentValue) {
      where.parentType = 'Category';
      where.parentValue = parentValue;
    }

    const dropdowns = await Dropdown.findAll({ where, order: [['value', 'ASC']] });
    res.json(dropdowns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/dropdowns
// @desc    Create new dropdown value
// @access  Private (Admin, Supervisor, SystemAdmin)
router.post('/', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { type, value, parentType, parentValue } = req.body;

    // Validate type
    if (!['Source', 'Category', 'Service', 'Office'].includes(type)) {
      return res.status(400).json({ message: 'Invalid dropdown type' });
    }

    // Check if value already exists
    const existing = await Dropdown.findOne({ where: { type, value } });
    if (existing) {
      return res.status(400).json({ message: 'This value already exists' });
    }

    // Create new dropdown value
    const dropdown = await Dropdown.create({
      type,
      value,
      parentType: type === 'Service' ? parentType : undefined,
      parentValue: type === 'Service' ? parentValue : undefined,
      createdBy: req.user.id,
    });

    // Send notification
    notificationService.notifyDropdownCreated({
      id: dropdown.id,
      type: dropdown.type,
      value: dropdown.value,
      parentType: dropdown.parentType,
      parentValue: dropdown.parentValue,
    });

    // Log the action
    // TODO: Implement audit logging

    res.status(201).json(dropdown);
  } catch (err) {
    console.error('Error creating dropdown:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/dropdowns/:id
// @desc    Update dropdown value
// @access  Private (Admin, Supervisor, SystemAdmin)
router.put('/:id', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { type, value, parentType, parentValue, isActive } = req.body;

    // Check if dropdown exists
    const dropdown = await Dropdown.findByPk(id);
    if (!dropdown) {
      return res.status(404).json({ message: 'Dropdown value not found' });
    }

    // Check permissions - SystemAdmin can modify any dropdown
    if (req.user.role !== 'SystemAdmin' && 
        req.user.role === 'Supervisor' && 
        dropdown.createdBy !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied - Supervisors can only modify their own dropdowns',
        userRole: req.user.role,
        dropdownCreator: dropdown.createdBy,
        currentUser: req.user.id
      });
    }

    // Update dropdown fields
    dropdown.type = type || dropdown.type;
    dropdown.value = value || dropdown.value;
    dropdown.parentType = type === 'Service' ? parentType : undefined;
    dropdown.parentValue = type === 'Service' ? parentValue : undefined;
    dropdown.isActive = isActive !== undefined ? isActive : dropdown.isActive;

    await dropdown.save();

    // Send notification
    notificationService.notifyDropdownUpdated({
      id: dropdown.id,
      type: dropdown.type,
      value: dropdown.value,
      parentType: dropdown.parentType,
      parentValue: dropdown.parentValue,
      isActive: dropdown.isActive,
    });

    // Log the action
    // TODO: Implement audit logging

    res.json(dropdown);
  } catch (err) {
    console.error('Error updating dropdown:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/dropdowns/:id
// @desc    Delete dropdown value
// @access  Private (Admin, Supervisor, SystemAdmin)
router.delete('/:id', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if dropdown exists
    const dropdown = await Dropdown.findByPk(id);
    if (!dropdown) {
      return res.status(404).json({ message: 'Dropdown value not found' });
    }

    // Check permissions - SystemAdmin can delete any dropdown
    if (req.user.role !== 'SystemAdmin' && 
        req.user.role === 'Supervisor' && 
        dropdown.createdBy !== req.user.id) {
      return res.status(403).json({ 
        message: 'Access denied - Supervisors can only delete their own dropdowns',
        userRole: req.user.role,
        dropdownCreator: dropdown.createdBy,
        currentUser: req.user.id
      });
    }

    // Don't actually delete, just deactivate
    dropdown.isActive = false;
    await dropdown.save();

    // Send notification
    notificationService.notifyDropdownDeleted({
      id: dropdown.id,
      type: dropdown.type,
      value: dropdown.value,
    });

    // Log the action
    // TODO: Implement audit logging

    res.json({ message: 'Dropdown value deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;