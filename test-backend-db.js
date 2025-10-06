// Test database connection using the same configuration as the backend
require('dotenv').config();

// Import the exact same database configuration as used in the backend
const { Sequelize } = require('sequelize');

// Create Sequelize instance exactly as in config/database.js
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      // SSL configuration for TiDB
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3
    }
  }
);

async function testConnection() {
  try {
    console.log('Testing database connection with backend configuration...');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    await sequelize.authenticate();
    console.log('✅ Connection successful!');
    
    // Try a simple query
    const [results] = await sequelize.query('SELECT 1+1 as result');
    console.log('✅ Simple query successful:', results[0].result);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
  }
}

testConnection();