const dotenv = require('dotenv');
dotenv.config();

console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
// Note: Don't log the password for security reasons
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

// Check if all required environment variables are set
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('Missing required database environment variables!');
  console.error('Please check your .env file');
  process.exit(1);
}

// Now test the database connection
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true
      }
    },
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Add connection timeout
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true
      },
      connectTimeout: 60000
    }
  }
);

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Try to get database version
    const [results] = await sequelize.query('SELECT VERSION() as version');
    console.log('Database version:', results[0].version);
    
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    if (error.parent) {
      console.error('Parent error:', error.parent.message);
    }
  } finally {
    await sequelize.close();
  }
}

testConnection();