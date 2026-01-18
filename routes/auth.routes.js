const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');
const { loginValidation } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for auth
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

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', cors(corsOptions), async (req, res) => {
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
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
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
        bio: user.bio,
        designation: user.designation
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
    console.log('Fetching user data for ID:', req.user?.id);
    
    // Basic validation of authenticated user
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    let user = null;
    try {
      user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });
    } catch (userErr) {
      console.error('Error fetching user data:', userErr);
      // If user fetch fails completely, return basic user info from token
      console.log('Returning user data from token for ID:', req.user.id);
      return res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        fullName: req.user.fullName || req.user.username,
        role: req.user.role,
        office: req.user.office || '',
        bloodGroup: '',
        phoneNumber: '',
        bio: '',
        designation: '',
        isActive: true, // Assume active if in token
        preferences: {
          theme: 'light',
          primaryColor: '#667eea',
          secondaryColor: '#f093fb',
          backgroundType: 'solid',
          backgroundColor: '#ffffff',
          gradientEndColor: '#f093fb',
          gradientDirection: 'to right',
          backgroundImage: null,
          language: 'en'
        }
      });
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Try to get user preferences with simplified error handling
    let preferences = {
      theme: 'light',
      primaryColor: '#667eea',
      secondaryColor: '#f093fb',
      backgroundType: 'solid',
      backgroundColor: '#ffffff',
      gradientEndColor: '#f093fb',
      gradientDirection: 'to right',
      backgroundImage: null,
      language: 'en'
    };
    
    try {
      const userPrefs = await UserPreferences.findOne({ where: { userId: user.id } });
      if (userPrefs) {
        preferences = {
          theme: userPrefs.theme,
          primaryColor: userPrefs.primaryColor,
          secondaryColor: userPrefs.secondaryColor,
          backgroundType: userPrefs.backgroundType,
          backgroundColor: userPrefs.backgroundColor,
          gradientEndColor: userPrefs.gradientEndColor,
          gradientDirection: userPrefs.gradientDirection,
          backgroundImage: userPrefs.backgroundImage,
          language: userPrefs.language
        };
      }
    } catch (prefErr) {
      console.error('Warning: Error fetching user preferences, using defaults:', prefErr);
      // Continue with default preferences
    }

    // Return user data with designation field and preferences
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      office: user.office,
      bloodGroup: user.bloodGroup,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      designation: user.designation,
      isActive: user.isActive,
      preferences: preferences
    };

    console.log('Sending user data response for ID:', user.id);
    res.json(userData);
  } catch (err) {
    console.error('Critical error in /api/auth/me:', err);
    console.error('Error stack:', err.stack);
    // Ultimate fallback response
    res.status(500).json({ 
      message: 'Server error in auth/me endpoint', 
      error: err.message,
      timestamp: new Date().toISOString()
    });
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
    const { fullName, email, office, bloodGroup, phoneNumber, bio, designation, preferences } = req.body;
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
    user.designation = designation || user.designation;

    await user.save();

    // Update user preferences if provided
    if (preferences) {
      let userPreferences = await UserPreferences.findOne({ where: { userId: userId } });
      if (!userPreferences) {
        // Create preferences if they don't exist
        userPreferences = await UserPreferences.create({
          userId: userId,
          ...preferences
        });
      } else {
        // Update existing preferences
        Object.keys(preferences).forEach(key => {
          if (userPreferences[key] !== undefined) {
            userPreferences[key] = preferences[key];
          }
        });
        await userPreferences.save();
      }
    }

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
      bio: user.bio,
      designation: user.designation
    });

    // Get updated preferences to return
    let updatedPreferences = null;
    try {
      updatedPreferences = await UserPreferences.findOne({ where: { userId: userId } });
      if (!updatedPreferences) {
        updatedPreferences = await UserPreferences.create({
          userId: userId,
          theme: 'light',
          primaryColor: '#667eea',
          secondaryColor: '#f093fb',
          backgroundType: 'solid',
          backgroundColor: '#ffffff',
          gradientEndColor: '#f093fb',
          gradientDirection: 'to right',
          language: 'en'
        });
      }
    } catch (prefErr) {
      console.error('Error fetching updated preferences:', prefErr);
      updatedPreferences = await UserPreferences.create({
        userId: userId,
        theme: 'light',
        primaryColor: '#667eea',
        secondaryColor: '#f093fb',
        backgroundType: 'solid',
        backgroundColor: '#ffffff',
        gradientEndColor: '#f093fb',
        gradientDirection: 'to right',
        language: 'en'
      });
    }

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
      bio: user.bio,
      designation: user.designation,
      preferences: {
        theme: updatedPreferences.theme,
        primaryColor: updatedPreferences.primaryColor,
        secondaryColor: updatedPreferences.secondaryColor,
        backgroundType: updatedPreferences.backgroundType,
        backgroundColor: updatedPreferences.backgroundColor,
        gradientEndColor: updatedPreferences.gradientEndColor,
        gradientDirection: updatedPreferences.gradientDirection,
        backgroundImage: updatedPreferences.backgroundImage,
        language: updatedPreferences.language
      }
    };

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;