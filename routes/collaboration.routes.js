const express = require('express');
const Collaboration = require('../models/Collaboration');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const cors = require('cors');

// CORS configuration for collaborations
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

console.log('Collaboration routes module loaded');

const router = express.Router();

// Add logging middleware for debugging
router.use((req, res, next) => {
  console.log(`Collaboration route accessed: ${req.method} ${req.url}`);
  next();
});

// Add a test route to verify the routes are working
router.get('/test', (req, res) => {
  console.log('Collaboration test route accessed');
  res.json({ message: 'Collaboration routes are working' });
});

// @route   GET /api/collaborations
// @desc    Get all collaborations
// @access  Private
router.get('/', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Fetching collaborations for user:', req.user);
    let where = {};
    
    // Agents, Admins and Supervisors can see collaborations from their office
    // This includes collaborations created by SystemAdmins in the same office
    if (req.user.role === 'Agent' || req.user.role === 'Admin' || req.user.role === 'Supervisor') {
      // Get all users in the office including SystemAdmins
      const officeUsers = await User.findAll({
        where: { office: req.user.office },
        attributes: ['id']
      });
      
      const officeUserIds = officeUsers.map(user => user.id);
      
      // Also get SystemAdmin users who might have created collaborations for this office
      const systemAdminUsers = await User.findAll({
        where: { role: 'SystemAdmin' },
        attributes: ['id']
      });
      
      const systemAdminUserIds = systemAdminUsers.map(user => user.id);
      
      // Combine both arrays
      const allRelevantUserIds = [...officeUserIds, ...systemAdminUserIds];
      
      where = {
        [require('sequelize').Op.or]: [
          { createdBy: req.user.id },
          { createdBy: { [require('sequelize').Op.in]: allRelevantUserIds } }
        ]
      };
    }
    // SystemAdmin can see all collaborations - no where clause needed

    const collaborations = await Collaboration.findAll({ 
      where, 
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });
    
    console.log('Found collaborations:', collaborations.length);
    res.json({ data: collaborations });
  } catch (err) {
    console.error('Error fetching collaborations:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/collaborations
// @desc    Create new collaboration
// @access  Private
router.post('/', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Creating collaboration for user:', req.user);
    console.log('Request body:', req.body);
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

    console.log('Created collaboration:', collaboration.id);
    // Send notification about collaboration creation
    notificationService.notifyCollaborationCreated(collaboration);

    // Reload collaboration with associations
    const fullCollaboration = await Collaboration.findByPk(collaboration.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.status(201).json({ data: fullCollaboration });
  } catch (err) {
    console.error('Error creating collaboration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/collaborations/:id
// @desc    Update collaboration
// @access  Private (Owner only)
router.put('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Updating collaboration:', req.params.id, 'for user:', req.user);
    const { id } = req.params;
    const { title, description, availability, urgency } = req.body;

    // Check if collaboration exists
    const collaboration = await Collaboration.findByPk(id);
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    // Check permissions - only creator can update
    if (collaboration.createdBy !== req.user.id && req.user.role !== 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - You can only update your own collaborations' });
    }

    // Update collaboration
    collaboration.title = title || collaboration.title;
    collaboration.description = description || collaboration.description;
    collaboration.availability = availability || collaboration.availability;
    collaboration.urgency = urgency || collaboration.urgency;

    await collaboration.save();

    // Create audit log for collaboration update
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'UPDATE',
        resourceType: 'COLLABORATION',
        resourceId: collaboration.id,
        description: `Collaboration "${collaboration.title}" updated by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for collaboration update:', auditError);
    }

    // Send notification about collaboration update
    notificationService.notifyCollaborationUpdated(collaboration);

    // Reload collaboration with associations
    const fullCollaboration = await Collaboration.findByPk(collaboration.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }]
    });

    res.json({ data: fullCollaboration });
  } catch (err) {
    console.error('Error updating collaboration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/collaborations/:id
// @desc    Delete collaboration
// @access  Private (Owner only)
router.delete('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    console.log('Deleting collaboration:', req.params.id, 'for user:', req.user);
    const { id } = req.params;

    // Check if collaboration exists
    const collaboration = await Collaboration.findByPk(id);
    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found' });
    }

    // Check permissions - only creator can delete
    if (collaboration.createdBy !== req.user.id && req.user.role !== 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - You can only delete your own collaborations' });
    }

    // Delete collaboration
    await collaboration.destroy();

    // Create audit log for collaboration deletion
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'DELETE',
        resourceType: 'COLLABORATION',
        resourceId: collaboration.id,
        description: `Collaboration "${collaboration.title}" deleted by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for collaboration deletion:', auditError);
    }

    // Send notification about collaboration deletion
    notificationService.notifyCollaborationDeleted(collaboration);

    res.json({ message: 'Collaboration removed' });
  } catch (err) {
    console.error('Error deleting collaboration:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;