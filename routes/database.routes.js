const express = require('express');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../services/logger.service');

const router = express.Router();

// Get database information
router.get('/info', async (req, res) => {
  try {
    // Get database connection info
    const dbConfig = sequelize.config;
    
    // Get table information
    const tables = await sequelize.getQueryInterface().showAllSchemas();
    
    // Get model counts
    const models = sequelize.models;
    const modelCounts = {};
    
    for (const modelName in models) {
      if (models.hasOwnProperty(modelName)) {
        try {
          const count = await models[modelName].count();
          modelCounts[modelName] = count;
        } catch (error) {
          modelCounts[modelName] = 'Error counting';
        }
      }
    }
    
    res.json({
      database: {
        name: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        connected: true
      },
      tables: tables,
      modelCounts: modelCounts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching database info', { error: error.message });
    res.status(500).json({ 
      message: 'Error fetching database information',
      error: error.message 
    });
  }
});

// Get table structure information
router.get('/tables/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Get table description
    const tableDescription = await sequelize.getQueryInterface().describeTable(tableName);
    
    res.json({
      tableName: tableName,
      columns: tableDescription,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching table info', { 
      error: error.message,
      tableName: req.params.tableName
    });
    res.status(500).json({ 
      message: 'Error fetching table information',
      error: error.message 
    });
  }
});

module.exports = router;