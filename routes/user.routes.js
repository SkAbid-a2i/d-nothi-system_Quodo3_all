const express = require('express');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { userValidation } = require('../validators/user.validator');
const sequelize = require('sequelize');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (SystemAdmin only)
// @access  Private (SystemAdmin)
router.get('/', authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const users = await User.findAll({
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

    const { username, email, password, fullName, role, office } = req.body;

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
    });

    // Log the action
    // TODO: Implement audit logging

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
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
    const { username, email, fullName, role, office, isActive } = req.body;

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

    await user.save();

    // Log the action
    // TODO: Implement audit logging

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      isActive: user.isActive,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (SystemAdmin only)
// @access  Private (SystemAdmin)
router.delete('/:id', authenticate, authorize('SystemAdmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't actually delete, just deactivate
    user.isActive = false;
    await user.save();

    // Log the action
    // TODO: Implement audit logging

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;