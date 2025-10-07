const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
let sequelize;

// Use TiDB configuration for production, SQLite for development
// Only use TiDB when explicitly in production environment
if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(
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

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });

module.exports = sequelize;