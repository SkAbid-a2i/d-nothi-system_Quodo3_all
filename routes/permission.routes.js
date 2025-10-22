const express = require('express');
const PermissionTemplate = require('../models/PermissionTemplate');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const cors = require('cors');

// CORS configuration for permissions
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://quodo3-frontend.netlify.app', 
    process.env.FRONTEND_URL_2 || 'http://localhost:3000',
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

// @route   GET /api/permissions/templates
// @desc    Get all permission templates
// @access  Private (SystemAdmin only)
router.get('/templates', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const templates = await PermissionTemplate.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/permissions/templates
// @desc    Create new permission template
// @access  Private (SystemAdmin only)
router.post('/templates', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Validate input
    if (!name || !permissions) {
      return res.status(400).json({ message: 'Name and permissions are required' });
    }

    // Check if template with same name already exists
    const existing = await PermissionTemplate.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: 'A template with this name already exists' });
    }

    // Create new template
    const template = await PermissionTemplate.create({
      name,
      permissions,
      createdBy: req.user.id
    });

    // Send notification
    notificationService.notifyPermissionTemplateCreated({
      id: template.id,
      name: template.name,
      permissions: template.permissions,
    });

    res.status(201).json(template);
  } catch (err) {
    console.error('Error creating permission template:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/permissions/templates/:id
// @desc    Update permission template
// @access  Private (SystemAdmin only)
router.put('/templates/:id', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    // Check if template exists
    const template = await PermissionTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'Permission template not found' });
    }

    // Check if another template with same name already exists
    if (name && name !== template.name) {
      const existing = await PermissionTemplate.findOne({ 
        where: { 
          name,
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existing) {
        return res.status(400).json({ message: 'A template with this name already exists' });
      }
    }

    // Update template
    template.name = name || template.name;
    template.permissions = permissions || template.permissions;
    template.updatedBy = req.user.id;

    await template.save();

    // Send notification
    notificationService.notifyPermissionTemplateUpdated({
      id: template.id,
      name: template.name,
      permissions: template.permissions,
    });

    res.json(template);
  } catch (err) {
    console.error('Error updating permission template:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/permissions/templates/:id
// @desc    Delete permission template
// @access  Private (SystemAdmin only)
router.delete('/templates/:id', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if template exists
    const template = await PermissionTemplate.findByPk(id);
    if (!template) {
      return res.status(404).json({ message: 'Permission template not found' });
    }

    // Store template name for notification before deletion
    const templateName = template.name;

    // Delete template
    await template.destroy();

    // Send notification
    notificationService.notifyPermissionTemplateDeleted({
      id: template.id,
      name: templateName,
    });

    res.json({ message: 'Permission template deleted successfully' });
  } catch (err) {
    console.error('Error deleting permission template:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;