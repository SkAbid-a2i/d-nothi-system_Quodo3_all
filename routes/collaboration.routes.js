const express = require('express');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { Op } = require('sequelize');

const router = express.Router();

// @route   GET /api/collaborations
// @desc    Get all collaborations
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let where = {};
    
    // Agents can only see collaborations they created
    if (req.user.role === 'Agent') {
      where = {
        createdBy: req.user.id
      };
    } 
    // Admins, SystemAdmins and Supervisors can see all collaborations
    else if (['Admin', 'SystemAdmin', 'Supervisor'].includes(req.user.role)) {
      // No additional filtering needed - they can see all
    }

    const collaborations = await Collaboration.findAll({ 
      where,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });
    
    res.json(collaborations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/collaborations
// @desc    Create new collaboration
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, availability, urgency } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create new collaboration
    const collaboration = await Collaboration.create({
      title,
      description,
      availability: availability || 'Always',
      urgency: urgency || 'None',
      createdBy: req.user.id
    });

    // Reload collaboration with creator info
    const fullCollaboration = await Collaboration.findByPk(collaboration.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.status(201).json(fullCollaboration);
  } catch (err) {
    console.error('Error creating collaboration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/collaborations/:id
// @desc    Update collaboration
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, availability, urgency } = req.body;

    // Check if collaboration exists
    const collaboration = await Collaboration.findByPk(id);
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    // Check permissions - only creator or Admin/SystemAdmin/Supervisor can update
    if (collaboration.createdBy !== req.user.id && !['Admin', 'SystemAdmin', 'Supervisor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied - You can only update your own collaborations' });
    }

    // Update collaboration
    collaboration.title = title || collaboration.title;
    collaboration.description = description || collaboration.description;
    collaboration.availability = availability || collaboration.availability;
    collaboration.urgency = urgency || collaboration.urgency;

    await collaboration.save();

    // Reload collaboration with creator info
    const fullCollaboration = await Collaboration.findByPk(collaboration.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.json(fullCollaboration);
  } catch (err) {
    console.error('Error updating collaboration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/collaborations/:id
// @desc    Delete collaboration
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if collaboration exists
    const collaboration = await Collaboration.findByPk(id);
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    // Check permissions - only creator or Admin/SystemAdmin/Supervisor can delete
    if (collaboration.createdBy !== req.user.id && !['Admin', 'SystemAdmin', 'Supervisor'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied - You can only delete your own collaborations' });
    }

    // Delete collaboration
    await collaboration.destroy();

    res.json({ message: 'Collaboration removed' });
  } catch (err) {
    console.error('Error deleting collaboration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;