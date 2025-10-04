// Logger service for backend error tracking and monitoring
const fs = require('fs');
const path = require('path');

// Simple date formatting function to avoid dependency issues
function formatDate(date, format) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (format === 'yyyy-MM-dd') {
    return `${year}-${month}-${day}`;
  }
  
  return date.toISOString();
}

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  writeLog(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      metadata,
      pid: process.pid,
      hostname: require('os').hostname()
    };

    // Write to file
    const logFile = path.join(this.logDir, `${formatDate(new Date(), 'yyyy-MM-dd')}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    // Also log to console for immediate visibility
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, metadata);

    // For errors, also write to a separate error log
    if (level === 'error') {
      const errorLogFile = path.join(this.logDir, `${formatDate(new Date(), 'yyyy-MM-dd')}-error.log`);
      fs.appendFileSync(errorLogFile, JSON.stringify(logEntry) + '\n');
    }
  }

  info(message, metadata = {}) {
    this.writeLog('info', message, metadata);
  }

  warn(message, metadata = {}) {
    this.writeLog('warn', message, metadata);
  }

  error(message, metadata = {}) {
    this.writeLog('error', message, metadata);
  }

  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.writeLog('debug', message, metadata);
    }
  }

  // Get logs for a specific date
  getLogs(date = null) {
    const logDate = date || formatDate(new Date(), 'yyyy-MM-dd');
    const logFile = path.join(this.logDir, `${logDate}.log`);
    
    if (!fs.existsSync(logFile)) {
      return [];
    }

    const logContent = fs.readFileSync(logFile, 'utf8');
    return logContent
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));
  }

  // Get error logs for a specific date
  getErrorLogs(date = null) {
    const logDate = date || formatDate(new Date(), 'yyyy-MM-dd');
    const errorLogFile = path.join(this.logDir, `${logDate}-error.log`);
    
    if (!fs.existsSync(errorLogFile)) {
      return [];
    }

    const logContent = fs.readFileSync(errorLogFile, 'utf8');
    return logContent
      .split('\n')
      .filter(line => line.trim() !== '')
      .map(line => JSON.parse(line));
  }

  // Analyze logs and provide insights
  analyzeLogs(hours = 24) {
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    const allLogs = [];
    
    // Get logs from the past specified hours
    for (let i = 0; i <= Math.ceil(hours / 24); i++) {
      const date = new Date(Date.now() - (i * 24 * 60 * 60 * 1000));
      const dateStr = formatDate(date, 'yyyy-MM-dd');
      const logs = this.getLogs(dateStr);
      allLogs.push(...logs.filter(log => new Date(log.timestamp) > cutoffTime));
    }

    // Categorize logs
    const categorizedLogs = {
      total: allLogs.length,
      byLevel: {
        error: allLogs.filter(log => log.level === 'error').length,
        warn: allLogs.filter(log => log.level === 'warn').length,
        info: allLogs.filter(log => log.level === 'info').length,
        debug: allLogs.filter(log => log.level === 'debug').length
      },
      errors: allLogs.filter(log => log.level === 'error'),
      recentLogs: allLogs.slice(-20), // Last 20 logs
      commonErrors: this.getCommonErrors(allLogs),
      apiActivity: this.getApiActivity(allLogs)
    };

    return categorizedLogs;
  }

  getCommonErrors(logs) {
    const errorMap = {};
    const errorLogs = logs.filter(log => log.level === 'error');
    
    errorLogs.forEach(log => {
      const key = log.message;
      if (!errorMap[key]) {
        errorMap[key] = { count: 0, examples: [] };
      }
      errorMap[key].count++;
      if (errorMap[key].examples.length < 3) {
        errorMap[key].examples.push({
          timestamp: log.timestamp,
          metadata: log.metadata
        });
      }
    });

    return Object.entries(errorMap)
      .map(([message, data]) => ({ message, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getApiActivity(logs) {
    const apiLogs = logs.filter(log => 
      log.metadata && 
      (log.metadata.endpoint || log.metadata.route || log.metadata.url)
    );

    const activity = {
      totalRequests: apiLogs.length,
      byMethod: {},
      byEndpoint: {},
      errors: apiLogs.filter(log => log.level === 'error').length
    };

    apiLogs.forEach(log => {
      const method = log.metadata.method || 'UNKNOWN';
      const endpoint = log.metadata.endpoint || log.metadata.route || log.metadata.url || 'UNKNOWN';
      
      if (!activity.byMethod[method]) {
        activity.byMethod[method] = 0;
      }
      activity.byMethod[method]++;
      
      if (!activity.byEndpoint[endpoint]) {
        activity.byEndpoint[endpoint] = 0;
      }
      activity.byEndpoint[endpoint]++;
    });

    return activity;
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;