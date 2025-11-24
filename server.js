const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Import logger service
const logger = require('./services/logger.service');
// Import notification service
const notificationService = require('./services/notification.service');
// Import database monitoring service
const dbMonitor = require('./services/db-monitor.service');

// Database connection
const sequelize = require('./config/database');
const MeetingUsers = require('./models/MeetingUsers');

// Middleware
app.use(helmet());

// Fix CORS configuration to handle comma-separated values in environment variables
function parseCorsOrigins() {
  const origins = [
    'https://quodo3-frontend.netlify.app',
    'http://localhost:3000',
    'https://d-nothi-zenith.vercel.app',
    'https://quodo3-frontend.onrender.com',
    'https://quodo3-backend.onrender.com',
    'https://d-nothi-system-quodo3-all.vercel.app',
    'https://d-nothi-system-quodo3-all-git-main-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-l49aqp6te-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-cn53p2hxd-skabid-5302s-projects.vercel.app',
    'https://d-nothi-system-quodo3-bp6mein7b-skabid-5302s-projects.vercel.app'
  ];

  // Handle FRONTEND_URL (might contain comma-separated values)
  if (process.env.FRONTEND_URL) {
    const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
    origins.push(...frontendUrls);
  }

  // Handle FRONTEND_URL_2
  if (process.env.FRONTEND_URL_2) {
    origins.push(process.env.FRONTEND_URL_2);
  }

  // Handle FRONTEND_URL_3
  if (process.env.FRONTEND_URL_3) {
    origins.push(process.env.FRONTEND_URL_3);
  }

  // Remove duplicates and empty values
  return [...new Set(origins)].filter(origin => origin && origin.length > 0);
}

app.use(cors({
  origin: parseCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false
}));

// Custom logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });

  next();
});

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Start database monitoring
dbMonitor.startMonitoring(30000); // Check every 30 seconds

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    logger.info('Connected to TiDB database');
  })
  .catch(err => {
    logger.error('Unable to connect to TiDB database', { error: err.message, stack: err.stack });
  });

// Simple route for testing
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({ 
    message: 'Welcome to Quodo3 API',
    status: 'Server is running',
    connectedClients: notificationService.getConnectedClients()
  });
});

// Handle HEAD requests to root as well
app.head('/', (req, res) => {
  logger.info('Root endpoint accessed (HEAD)');
  res.status(200).end();
});

// Debug endpoint to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({
    FRONTEND_URL: process.env.FRONTEND_URL,
    FRONTEND_URL_2: process.env.FRONTEND_URL_2,
    FRONTEND_URL_3: process.env.FRONTEND_URL_3,
    corsOrigins: [
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
    ]
  });
});

// SSE endpoint for real-time notifications (must be after middleware)
app.get('/api/notifications', cors({
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
    'https://d-nothi-system-quodo3-bp6mein7b-skabid-5302s-projects.vercel.app',
    'http://localhost:3001' // For testing
  ],
  credentials: true,
  optionsSuccessStatus: 200
}), (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  
  logger.info('User connected to notifications', { userId });
  notificationService.addClient(userId, res);
});

// Endpoint to create Kanban table (for production use)
app.post('/api/setup/kanban-table', cors({
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
  optionsSuccessStatus: 200
}), async (req, res) => {
  try {
    // Check if we're in production environment
    if (process.env.NODE_ENV !== 'production') {
      return res.status(400).json({ message: 'This endpoint is only available in production' });
    }
    
    // Check if kanban table exists
    const [results] = await sequelize.query(
      "SHOW TABLES LIKE 'kanban'",
      { type: sequelize.QueryTypes.SELECT }
    );
    
    if (results && results.length > 0) {
      return res.json({ message: 'Kanban table already exists' });
    }
    
    // Create kanban table
    await sequelize.query(`
      CREATE TABLE kanban (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'backlog',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `, { type: sequelize.QueryTypes.RAW });
    
    // Create indexes
    await sequelize.query(
      'CREATE INDEX idx_kanban_status ON kanban(status)',
      { type: sequelize.QueryTypes.RAW }
    );
    
    await sequelize.query(
      'CREATE INDEX idx_kanban_created_at ON kanban(createdAt)',
      { type: sequelize.QueryTypes.RAW }
    );
    
    logger.info('Kanban table created successfully');
    res.json({ message: 'Kanban table created successfully' });
  } catch (error) {
    logger.error('Error creating Kanban table', { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Error creating Kanban table', error: error.message });
  }
});

// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const leaveRoutes = require('./routes/leave.routes');
const dropdownRoutes = require('./routes/dropdown.routes');
const reportRoutes = require('./routes/report.routes');
const auditRoutes = require('./routes/audit.routes');
const logRoutes = require('./routes/log.routes');
const frontendLogRoutes = require('./routes/frontendLog.routes');
const permissionRoutes = require('./routes/permission.routes');
const fileRoutes = require('./routes/file.routes');
const meetingRoutes = require('./routes/meeting.routes');
const healthRoutes = require('./routes/health.routes');
const collaborationRoutes = require('./routes/collaboration.routes');
const notificationRoutes = require('./routes/notification.routes');
const kanbanRoutes = require('./routes/kanban.routes');

// Add debugging to check if routes are loaded
console.log('Collaboration routes loaded:', !!collaborationRoutes);

// Apply global CORS middleware to all routes
app.use(cors({
  origin: parseCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  preflightContinue: false
}));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dropdowns', dropdownRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/kanban', kanbanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message, 
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });
  
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  logger.warn('Route not found', { url: req.originalUrl, method: req.method });
  res.status(404).json({ message: 'Route not found' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection', { error: err.message, stack: err.stack });
  // Don't exit process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  // Don't exit process, just log the error
});

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = app;