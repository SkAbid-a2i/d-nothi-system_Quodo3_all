const express = require('express');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const File = require('../models/File');
const Meeting = require('../models/Meeting');
const Collaboration = require('../models/Collaboration');
const UserPreferences = require('../models/UserPreferences');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { userValidation, userUpdateValidation } = require('../validators/user.validator');
const sequelize = require('sequelize');
const notificationService = require('../services/notification.service');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// CORS configuration for users
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

// @route   GET /api/users
// @desc    Get all users (SystemAdmin, Admin, Supervisor, Agent)
// @access  Private
router.get('/', cors(corsOptions), authenticate, async (req, res) => {
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
router.post('/', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    // Validate request body
    const { error } = userValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, email, password, fullName, role, office, bloodGroup, phoneNumber, bio, designation } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [sequelize.Op.or]: [{ username }, { email }],
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this username or email already exists' });
    }

    // Hash the password before creating the user
    let hashedPassword = password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      office,
      bloodGroup,
      phoneNumber,
      bio,
      designation
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
      phoneNumber: user.phoneNumber,
      designation: user.designation
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
      bio: user.bio,
      designation: user.designation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (SystemAdmin, Admin, Supervisor)
// @access  Private (SystemAdmin, Admin, Supervisor)
router.put('/:id', cors(corsOptions), authenticate, authorize('SystemAdmin', 'Admin', 'Supervisor'), async (req, res) => {
  try {
    // Validate request body
    const { error } = userUpdateValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { id } = req.params;
    const { username, email, password, fullName, role, office, isActive, bloodGroup, phoneNumber, bio, designation } = req.body;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Admin and Supervisor from updating SystemAdmin users
    if ((req.user.role === 'Admin' || req.user.role === 'Supervisor') && user.role === 'SystemAdmin') {
      return res.status(403).json({ message: 'Access denied - Admin and Supervisor cannot update SystemAdmin users' });
    }

    // Prevent Admin and Supervisor from updating passwords
    if ((req.user.role === 'Admin' || req.user.role === 'Supervisor') && password) {
      return res.status(403).json({ message: 'Access denied - Admin and Supervisor cannot update passwords' });
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    // Only update password if provided and user has proper permissions (only SystemAdmin can update passwords)
    if (password && req.user.role === 'SystemAdmin') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    user.fullName = fullName || user.fullName;
    user.role = role || user.role;
    user.office = office || user.office;
    user.isActive = isActive !== undefined ? isActive : user.isActive;
    user.bloodGroup = bloodGroup || user.bloodGroup;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;
    user.designation = designation || user.designation;

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
      phoneNumber: user.phoneNumber,
      designation: user.designation
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
      bio: user.bio,
      designation: user.designation
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (SystemAdmin only)
// @access  Private (SystemAdmin)
router.delete('/:id', cors(corsOptions), authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related records first to avoid foreign key constraint issues
    try {
      await Leave.destroy({ where: { userId: id } });
      await Task.destroy({ where: { userId: id } });
      await Notification.destroy({ where: { userId: id } });
      
      // Delete related meetings where user is the creator
      await Meeting.destroy({ where: { userId: id } });
      
      // Delete related collaborations
      await Collaboration.destroy({ where: { userId: id } });
      
      // Delete related files
      await File.destroy({ where: { userId: id } });
      
      // Delete user preferences
      await UserPreferences.destroy({ where: { userId: id } });
    } catch (cleanupError) {
      console.error('Error during user record cleanup:', cleanupError);
      // Continue with user deletion even if cleanup fails
    }

    // Store user data for notification before deletion
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      isActive: user.isActive,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber,
      designation: user.designation
    };

    // Delete user
    await user.destroy();

    // Create audit log for user deletion
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        userId: req.user.id,
        userName: req.user.username,
        action: 'DELETE',
        resourceType: 'USER',
        resourceId: user.id,
        description: `User "${user.username}" deleted by ${req.user.username}`
      });
    } catch (auditError) {
      console.error('Error creating audit log for user deletion:', auditError);
    }

    // Send notification
    notificationService.notifyUserDeleted(userData);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
