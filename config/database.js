const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
let sequelize;

// Use TiDB configuration for production, SQLite for development
// Only use TiDB when explicitly in production environment
if (process.env.NODE_ENV === 'production' || process.env.DB_HOST) {
  // Use MySQL/TiDB for production or when DB_HOST is explicitly set
  console.log('Using MySQL/TiDB database');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'quodo3',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 4000, // TiDB default port
      dialect: 'mysql',
      dialectOptions: {
        // SSL configuration for TiDB
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false
        } : {
          rejectUnauthorized: false
        }
      },
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 20, // Increased pool size
        min: 5,  // Increased minimum connections
        acquire: 60000, // Increased timeout to 60 seconds
        idle: 10000,
        evict: 1000 // Evict idle connections more aggressively
      },
      retry: {
        max: 5, // Increase retry attempts
        match: [
          /ETIMEDOUT/,
          /EHOSTUNREACH/,
          /ECONNRESET/,
          /ECONNREFUSED/,
          /ETIMEDOUT/,
          /ESOCKETTIMEDOUT/,
          /EPIPE/,
          /SequelizeConnectionError/,
          /SequelizeConnectionRefusedError/
        ]
      },
      timezone: '+00:00', // Set timezone to UTC
      benchmark: true, // Enable benchmarking
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED // Set isolation level
    }
  );
} else {
  // Use SQLite for development when not in production
  console.log('Using SQLite for development');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

// Test the connection with retry logic
async function testConnection(maxRetries = 5, retryDelay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      return true;
    } catch (err) {
      console.error(`Unable to connect to database (attempt ${i + 1}/${maxRetries}):`, err.message);
      if (i < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  console.error('Failed to connect to database after all retries');
  return false;
}

// Run the connection test
testConnection().catch(err => {
  console.error('Database connection test failed:', err);
});

module.exports = sequelize;