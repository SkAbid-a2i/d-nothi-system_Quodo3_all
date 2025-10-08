// Database Monitoring Service
const db = require('../config/database');
const appLogger = require('./logger.service');

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
    
    appLogger.info('Database monitoring started', { interval: `${intervalMs}ms` });
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      appLogger.info('Database monitoring stopped');
    }
  }

  // Check database connection
  async checkConnection() {
    try {
      await db.authenticate();
      this.isConnected = true;
      this.lastCheck = new Date();
      
      // Log successful connection
      appLogger.info('Database connection OK', {
        timestamp: this.lastCheck.toISOString(),
        dialect: db.getDialect(),
        host: db.config.host
      });
      
      return true;
    } catch (error) {
      this.isConnected = false;
      this.lastCheck = new Date();
      
      // Log connection error
      appLogger.error('Database connection failed', {
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
      dialect: db.getDialect(),
      host: db.config.host,
      port: db.config.port,
      database: db.config.database
    };
  }

  // Attempt to reconnect
  async reconnect() {
    appLogger.info('Attempting database reconnection');
    return await this.checkConnection();
  }
}

// Create singleton instance
const dbMonitor = new DatabaseMonitor();

module.exports = dbMonitor;