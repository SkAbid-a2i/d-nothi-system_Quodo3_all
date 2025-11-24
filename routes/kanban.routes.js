const express = require('express');
const Kanban = require('../models/Kanban');
const { authenticate } = require('../middleware/auth.middleware');
const cors = require('cors');

// CORS configuration for kanban
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
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
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

const router = express.Router();

// Apply CORS middleware to all routes
router.use(cors(corsOptions));

// Handle preflight requests
router.options('*', cors(corsOptions));

// @route   GET /api/kanban
// @desc    Get all kanban cards
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const cards = await Kanban.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ data: cards });
  } catch (err) {
    console.error('Error fetching kanban cards:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST /api/kanban
// @desc    Create new kanban card
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Create new kanban card
    const card = await Kanban.create({
      title,
      description,
      status: status || 'backlog'
    });

    res.status(201).json({ data: card });
  } catch (err) {
    console.error('Error creating kanban card:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT /api/kanban/:id
// @desc    Update kanban card
// @access  Private
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Check if card exists
    const card = await Kanban.findByPk(id);
    if (!card) {
      return res.status(404).json({ message: 'Kanban card not found' });
    }

    // Update card
    card.title = title || card.title;
    card.description = description || card.description;
    card.status = status || card.status;

    await card.save();

    res.json({ data: card });
  } catch (err) {
    console.error('Error updating kanban card:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE /api/kanban/:id
// @desc    Delete kanban card
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if card exists
    const card = await Kanban.findByPk(id);
    if (!card) {
      return res.status(404).json({ message: 'Kanban card not found' });
    }

    // Delete card
    await card.destroy();

    res.json({ message: 'Kanban card removed' });
  } catch (err) {
    console.error('Error deleting kanban card:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;