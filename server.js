const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { parseCorsOrigins } = require('./config/cors');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

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

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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