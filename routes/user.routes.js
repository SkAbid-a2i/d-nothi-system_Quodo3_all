const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { userValidation } = require('../validators/user.validator');
const sequelize = require('sequelize');
const notificationService = require('../services/notification.service');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (SystemAdmin, Admin, Supervisor, Agent)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    // Agents can only see active users
    const where = req.user.role === 'Agent' ? { isActive: true } : {};
    
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Create new user (SystemAdmin only)
// @access  Private (SystemAdmin)
router.post('/', authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    // Validate request body
    const { error } = userValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, fullName, role, office, bloodGroup, phoneNumber, bio } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ username }, { email }],
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
      role,
      office,
      bloodGroup,
      phoneNumber,
      bio
    });

    // Create audit log for user creation
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'CREATE',
        resourceType: 'USER',
        resourceId: user.id,
        description: `User "${username}" created by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for user creation:', auditError);
    }

    // Send notification
    notificationService.notifyUserCreated({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber,
      bio: user.bio
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (SystemAdmin only)
// @access  Private (SystemAdmin)
router.put('/:id', authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, fullName, role, office, isActive, bloodGroup, phoneNumber, bio } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    user.role = role || user.role;
    user.office = office || user.office;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.bloodGroup = bloodGroup || user.bloodGroup;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;

    await user.save();

    // Create audit log for user update
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'UPDATE',
        resourceType: 'USER',
        resourceId: user.id,
        description: `User "${username || user.username}" updated by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for user update:', auditError);
    }

    // Send notification
    notificationService.notifyUserUpdated({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      isActive: user.isActive,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber
    });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      isActive: user.isActive,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber,
      bio: user.bio
    });
  } catch (err) {
    console.error(err);