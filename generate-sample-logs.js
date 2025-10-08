const logger = require('./services/logger.service');

// Generate sample logs for testing
console.log('Generating sample logs...');

// Generate info logs
logger.info('Application started successfully', { version: '1.0.0', environment: 'development' });
logger.info('User login successful', { userId: 123, username: 'admin' });
logger.info('Task created', { taskId: 456, userId: 123 });

// Generate warning logs
logger.warn('High memory usage detected', { memoryUsage: '85%', threshold: '80%' });
logger.warn('Slow API response', { endpoint: '/api/tasks', responseTime: '2500ms' });

// Generate error logs
logger.error('Database connection failed', { 
  database: 'TiDB', 
  host: 'localhost', 
  port: 4000,
  error: 'Connection timeout'
});

logger.error('Failed to fetch dropdown values', { 
  endpoint: '/api/dropdowns/Category', 
  userId: 123,
  error: 'Network timeout'
});

logger.error('Task creation failed', { 
  userId: 123, 
  taskData: { source: 'Email', category: 'IT Support' },
  error: 'Validation failed'
});

console.log('Sample logs generated successfully!');