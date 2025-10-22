const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const File = require('../models/File');
const { authenticate } = require('../middleware/auth.middleware');
const logger = require('../services/logger.service');
const cors = require('cors');

// CORS configuration for files
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.access(uploadDir);
    } catch (error) {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @route   GET /api/files
// @desc    Get all files for the authenticated user
// @access  Private
router.get('/', cors(corsOptions), authenticate, async (req, res) => {
  try {
    logger.info('Fetching files for user', { userId: req.user.id });
    
    const files = await File.findAll({
      where: { userId: req.user.id },
      order: [['uploadedAt', 'DESC']]
    });
    
    logger.info('Files fetched successfully', { userId: req.user.id, count: files.length });
    res.json(files);
  } catch (err) {
    logger.error('Error fetching files', { 
      error: err.message, 
      stack: err.stack,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/files/upload
// @desc    Upload a new file
// @access  Private
router.post('/upload', cors(corsOptions), authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    logger.info('File uploaded', { 
      userId: req.user.id,
      filename: req.file.originalname,
      size: req.file.size
    });
    
    // Create file record in database
    const file = await File.create({
      name: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimeType: req.file.mimetype,
      userId: req.user.id
    });
    
    logger.info('File record created', { fileId: file.id, userId: req.user.id });
    
    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id: file.id,
        name: file.name,
        originalName: file.originalName,
        size: file.size,
        mimeType: file.mimeType,
        uploadedAt: file.uploadedAt
      }
    });
  } catch (err) {
    logger.error('Error uploading file', { 
      error: err.message, 
      stack: err.stack,
      userId: req.user.id
    });
    
    // Clean up uploaded file if database operation failed
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkErr) {
        logger.error('Error deleting uploaded file after DB failure', { 
          error: unlinkErr.message,
          filePath: req.file.path
        });
      }
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/files/:id/download
// @desc    Download a file
// @access  Private
router.get('/:id/download', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Downloading file', { fileId: id, userId: req.user.id });
    
    // Find file and verify ownership
    const file = await File.findOne({
      where: {
        id: id,
        userId: req.user.id
      }
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Check if file exists on disk
    try {
      await fs.access(file.path);
    } catch (err) {
      logger.error('File not found on disk', { 
        fileId: id, 
        filePath: file.path,
        error: err.message 
      });
      return res.status(404).json({ message: 'File not found on disk' });
    }
    
    // Set headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.size);
    
    // Stream file to response
    const fileStream = require('fs').createReadStream(file.path);
    fileStream.pipe(res);
    
    fileStream.on('error', (err) => {
      logger.error('Error streaming file', { 
        fileId: id, 
        error: err.message,
        filePath: file.path
      });
      res.status(500).json({ message: 'Error streaming file' });
    });
    
    res.on('finish', () => {
      logger.info('File download completed', { fileId: id, userId: req.user.id });
    });
  } catch (err) {
    logger.error('Error downloading file', { 
      error: err.message, 
      stack: err.stack,
      fileId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete a file
// @access  Private
router.delete('/:id', cors(corsOptions), authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    logger.info('Deleting file', { fileId: id, userId: req.user.id });
    
    // Find file and verify ownership
    const file = await File.findOne({
      where: {
        id: id,
        userId: req.user.id
      }
    });
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete file from disk
    try {
      await fs.unlink(file.path);
      logger.info('File deleted from disk', { filePath: file.path });
    } catch (err) {
      logger.error('Error deleting file from disk', { 
        error: err.message,
        filePath: file.path
      });
      // Continue with database deletion even if file deletion fails
    }
    
    // Delete file record from database
    await file.destroy();
    logger.info('File record deleted', { fileId: id, userId: req.user.id });
    
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    logger.error('Error deleting file', { 
      error: err.message, 
      stack: err.stack,
      fileId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;