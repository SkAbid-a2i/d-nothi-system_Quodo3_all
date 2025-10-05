const { Sequelize } = require('sequelize');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Create Sequelize instance
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

// Load all models
const models = {};

// Read all model files
const modelsDir = path.join(__dirname, '../models');
fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(modelsDir, file));
    models[model.name] = model;
  });

// Set up associations if any
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Add models to sequelize instance
sequelize.models = models;

// Test the connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection to TiDB has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to TiDB:', err);
  });

module.exports = sequelize;