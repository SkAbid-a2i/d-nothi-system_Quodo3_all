const express = require('express');
const Dropdown = require('../models/Dropdown');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const cors = require('cors');

// CORS configuration for dropdowns
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

// @route   GET /api/dropdowns
// @desc    Get all dropdown values
// @access  Private
router.get('/', cors(corsOptions), authenticate, async (req, res) => {
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
    if (!['Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation'].includes(type)) {
      return res.status(400).json({ message: 'Invalid dropdown type' });
    }

    let where = { type, isActive: true };
    
    // For sub-categories, filter by parent category if provided
    if (type === 'Sub-Category' && parentValue) {
      where.parentType = 'Category';
      where.parentValue = parentValue;
    }
    
    // For incidents, filter by parent sub-category if provided
    if (type === 'Incident' && parentValue) {
      where.parentType = 'Sub-Category';
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
    if (!['Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation'].includes(type)) {
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
      parentType: (type === 'Sub-Category' || type === 'Incident') ? parentType : undefined,
      parentValue: (type === 'Sub-Category' || type === 'Incident') ? parentValue : undefined,
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
    dropdown.parentType = (type === 'Sub-Category' || type === 'Incident') ? parentType : undefined;
    dropdown.parentValue = (type === 'Sub-Category' || type === 'Incident') ? parentValue : undefined;
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
router.delete('/:id', cors(corsOptions), authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
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

    await dropdown.destroy();

    // Send notification
    notificationService.notifyDropdownDeleted({
      id: dropdown.id,
      type: dropdown.type,
      value: dropdown.value,
      parentType: dropdown.parentType,
      parentValue: dropdown.parentValue,
      isActive: dropdown.isActive,
    });

    // Log the action
    // TODO: Implement audit logging

    res.json({ message: 'Dropdown value deleted successfully' });
  } catch (err) {
    console.error('Error deleting dropdown:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/dropdowns/bulk
// @desc    Bulk create dropdown values
// @access  Private (Admin, Supervisor, SystemAdmin)
router.post('/bulk', authenticate, authorize('Admin', 'Supervisor', 'SystemAdmin'), async (req, res) => {
  try {
    const { dropdowns } = req.body;
    
    if (!Array.isArray(dropdowns)) {
      return res.status(400).json({ message: 'Dropdowns must be an array' });
    }
    
    if (dropdowns.length === 0) {
      return res.status(400).json({ message: 'Dropdowns array cannot be empty' });
    }
    
    // Validate each dropdown item
    for (const dropdown of dropdowns) {
      if (!dropdown.type || !dropdown.value) {
        return res.status(400).json({ message: `Missing required fields for dropdown: ${JSON.stringify(dropdown)}` });
      }
      
      // Validate type
      if (!['Source', 'Category', 'Sub-Category', 'Incident', 'Office', 'Obligation'].includes(dropdown.type)) {
        return res.status(400).json({ message: `Invalid dropdown type: ${dropdown.type}` });
      }
    }
    
    // Check for duplicates within the batch
    const seen = new Set();
    for (const dropdown of dropdowns) {
      const key = `${dropdown.type}-${dropdown.value}`;
      if (seen.has(key)) {
        return res.status(400).json({ message: `Duplicate dropdown value found in batch: ${dropdown.type} - ${dropdown.value}` });
      }
      seen.add(key);
    }
    
    // Check for duplicates against existing database entries
    const results = [];
    const errors = [];
    
    for (let i = 0; i < dropdowns.length; i++) {
      const dropdown = dropdowns[i];
      try {
        // Check if value already exists
        const existing = await Dropdown.findOne({ 
          where: { type: dropdown.type, value: dropdown.value } 
        });
        
        if (existing) {
          errors.push({
            index: i, // Use loop index instead of indexOf for better performance
            data: dropdown,
            error: 'This value already exists'
          });
          continue;
        }
        
        // Create new dropdown value
        const newDropdown = await Dropdown.create({
          type: dropdown.type,
          value: dropdown.value,
          parentType: (dropdown.type === 'Sub-Category' || dropdown.type === 'Incident') ? dropdown.parentType : undefined,
          parentValue: (dropdown.type === 'Sub-Category' || dropdown.type === 'Incident') ? dropdown.parentValue : undefined,
          createdBy: req.user.id,
        });
        
        results.push(newDropdown);
      } catch (err) {
        errors.push({
          index: i, // Use loop index instead of indexOf for better performance
          data: dropdown,
          error: err.message
        });
      }
    }
    
    const response = {
      success: results.length,
      errors: errors.length,
      results,
      errors: errors
    };
    
    if (errors.length > 0 && results.length === 0) {
      // All failed
      return res.status(400).json(response);
    } else if (errors.length > 0) {
      // Some succeeded, some failed
      return res.status(207).json(response); // 207 Multi-Status
    } else {
      // All succeeded
      res.status(201).json(response);
    }
  } catch (err) {
    console.error('Error in bulk dropdown creation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
