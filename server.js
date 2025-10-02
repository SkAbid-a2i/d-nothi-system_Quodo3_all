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

// Database connection
const sequelize = require('./config/database');

// Middleware
app.use(helmet());
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'https://quodo3-frontend.netlify.app', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  exposedHeaders: ['Authorization'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to TiDB database');
  })
  .catch(err => {
    console.error('Unable to connect to TiDB database:', err);
  });

// Simple route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Quodo3 API',
    status: 'Server is running'
  });
});

// Import route files
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskRoutes = require('./routes/task.routes');
const leaveRoutes = require('./routes/leave.routes');
const dropdownRoutes = require('./routes/dropdown.routes');
const reportRoutes = require('./routes/report.routes');
const auditRoutes = require('./routes/audit.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dropdowns', dropdownRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Sync database models
  try {
    // For TiDB, we'll sync without altering existing tables to avoid constraint issues
    await sequelize.sync({ alter: false });
    console.log('Database synced successfully with TiDB');
  } catch (error) {
    console.error('Error syncing database with TiDB:', error);
  }
  
  // Test email service
  const emailService = require('./services/email.service');
  console.log('Email service initialized');
});

module.exports = app;