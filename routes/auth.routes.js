const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { loginValidation } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const { error } = loginValidation(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ 
      where: {
        [require('sequelize').Op.or]: [
          { username: username },
          { email: username }
        ],
        isActive: true
      }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        username: user.username,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        office: user.office,
        bloodGroup: user.bloodGroup,
        phoneNumber: user.phoneNumber,
        bio: user.bio
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error in /api/auth/me:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed automatically by the setter)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const { fullName, email, office, bloodGroup, phoneNumber, bio } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.office = office || user.office;
    user.bloodGroup = bloodGroup || user.bloodGroup;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.bio = bio || user.bio;

    await user.save();

    // Log the updated user data for debugging
    console.log('Updated user data:', {
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

    // Return updated user data (excluding password)
    const updatedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber,
      bio: user.bio
    };

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;