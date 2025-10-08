// Database Monitoring Service
const sequelize = require('../config/database');
const logger = require('./logger.service');

class DatabaseMonitor {
  constructor() {
    this.isConnected = false;
    this.lastCheck = null;
    this.checkInterval = null;
  }

  // Start monitoring database connection
  startMonitoring(intervalMs = 30000) { // Check every 30 seconds
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      await this.checkConnection();
    }, intervalMs);
    
    // Initial check
    this.checkConnection();
    
    logger.info('Database monitoring started', { interval: `${intervalMs}ms` });
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Database monitoring stopped');
    }
  }

  // Check database connection
  async checkConnection() {
    try {
      await sequelize.authenticate();
      this.isConnected = true;
      this.lastCheck = new Date();
      
      // Log successful connection
      logger.info('Database connection OK', {
        timestamp: this.lastCheck.toISOString(),
        dialect: sequelize.getDialect(),
        host: sequelize.config.host
      });
      
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastCheck = new Date();
      
      // Log connection error
      logger.error('Database connection failed', {
        timestamp: this.lastCheck.toISOString(),
        error: error.message,
        stack: error.stack
      });
      
      return false;
    }
  }

  // Get current status
  getStatus() {
    return {
      connected: this.isConnected,
      lastCheck: this.lastCheck,
      dialect: sequelize.getDialect(),
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database
    };
  }

  // Attempt to reconnect
  async reconnect() {
    logger.info('Attempting database reconnection');
    return await this.checkConnection();
  }
}

// Create singleton instance
const dbMonitor = new DatabaseMonitor();

module.exports = dbMonitor;// Database Monitoring Service
const sequelize = require('../config/database');
const logger = require('./logger.service');

class DatabaseMonitor {
  constructor() {
    this.isConnected = false;
    this.lastCheck = null;
    this.checkInterval = null;
  }

  // Start monitoring database connection
  startMonitoring(intervalMs = 30000) { // Check every 30 seconds
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    this.checkInterval = setInterval(async () => {
      await this.checkConnection();
    }, intervalMs);
    
    // Initial check
    this.checkConnection();
    
    logger.info('Database monitoring started', { interval: `${intervalMs}ms` });
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('Database monitoring stopped');
    }
  }

  // Check database connection
  async checkConnection() {
    try {
      await sequelize.authenticate();
      this.isConnected = true;
      this.lastCheck = new Date();
      
      // Log successful connection
      logger.info('Database connection OK', {
        timestamp: this.lastCheck.toISOString(),
        dialect: sequelize.getDialect(),
        host: sequelize.config.host
      });
      
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastCheck = new Date();
      
      // Log connection error
      logger.error('Database connection failed', {
        timestamp: this.lastCheck.toISOString(),
        error: error.message,
        stack: error.stack
      });
      
      return false;
    }
  }

  // Get current status
  getStatus() {
    return {
      connected: this.isConnected,
      lastCheck: this.lastCheck,
      dialect: sequelize.getDialect(),
      host: sequelize.config.host,
      port: sequelize.config.port,
      database: sequelize.config.database
    };
  }

  // Attempt to reconnect
  async reconnect() {
    logger.info('Attempting database reconnection');
    return await this.checkConnection();
  }
}

// Create singleton instance
const dbMonitor = new DatabaseMonitor();

module.exports = dbMonitor;