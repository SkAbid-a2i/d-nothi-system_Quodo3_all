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
app.use(cors({
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

// SSE endpoint for real-time notifications (must be after middleware)
app.get('/api/notifications', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  
  logger.info('User connected to notifications', { userId });
  notificationService.addClient(userId, res);
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

// Use routes
app.use('/api/auth', (req, res, next) => {
  logger.info('Auth routes accessed', { endpoint: '/api/auth' + req.url });
  next();
}, authRoutes);

app.use('/api/users', (req, res, next) => {
  logger.info('User routes accessed', { endpoint: '/api/users' + req.url });
  next();
}, userRoutes);

app.use('/api/tasks', (req, res, next) => {
  logger.info('Task routes accessed', { endpoint: '/api/tasks' + req.url });
  next();
}, taskRoutes);

app.use('/api/leaves', (req, res, next) => {
  logger.info('Leave routes accessed', { endpoint: '/api/leaves' + req.url });
  next();
}, leaveRoutes);

app.use('/api/dropdowns', (req, res, next) => {
  logger.info('Dropdown routes accessed', { endpoint: '/api/dropdowns' + req.url });
  next();
}, dropdownRoutes);

app.use('/api/reports', (req, res, next) => {
  logger.info('Report routes accessed', { endpoint: '/api/reports' + req.url });
  next();
}, reportRoutes);

app.use('/api/audit', (req, res, next) => {
  logger.info('Audit routes accessed', { endpoint: '/api/audit' + req.url });
  next();
}, auditRoutes);

app.use('/api/logs', (req, res, next) => {
  logger.info('Log routes accessed', { endpoint: '/api/logs' + req.url });
  next();
}, logRoutes);

app.use('/api/frontend-logs', (req, res, next) => {
  logger.info('Frontend log routes accessed', { endpoint: '/api/frontend-logs' + req.url });
  next();
}, frontendLogRoutes);

app.use('/api/permissions', (req, res, next) => {
  logger.info('Permission routes accessed', { endpoint: '/api/permissions' + req.url });
  next();
}, permissionRoutes);

app.use('/api/files', (req, res, next) => {
  logger.info('File routes accessed', { endpoint: '/api/files' + req.url });
  next();
}, fileRoutes);

app.use('/api/meetings', (req, res, next) => {
  logger.info('Meeting routes accessed', { endpoint: '/api/meetings' + req.url });
  next();
}, meetingRoutes);

app.use('/api/health', (req, res, next) => {
  logger.info('Health routes accessed', { endpoint: '/api/health' + req.url });
  next();
}, healthRoutes);

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

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Server is running on port ${PORT}`);
  
  // Sync database models
  try {
    // For TiDB, we'll sync without altering existing tables to avoid constraint issues
    await sequelize.sync({ alter: false });
    logger.info('Database synced successfully with TiDB');
  } catch (error) {
    logger.error('Error syncing database with TiDB', { error: error.message, stack: error.stack });
  }
  
  // Test email service
  try {
    const emailService = require('./services/email.service');
    logger.info('Email service initialized');
  } catch (error) {
    logger.error('Failed to initialize email service', { error: error.message, stack: error.stack });
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  dbMonitor.stopMonitoring(); // Stop database monitoring
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  dbMonitor.stopMonitoring(); // Stop database monitoring
  server.close(() => {
    logger.info('Process terminated');
  });
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

module.exports = app;