// Frontend logger service for tracking client-side errors and user interactions
class FrontendLogger {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.sessionId = this.generateSessionId();
    this.userId = null;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  async sendLog(level, message, metadata = {}) {
    try {
      // In production, we might want to send logs to the backend
      // For now, we'll just log to console but with structured data
      const logEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        metadata,
        sessionId: this.sessionId,
        userId: this.userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
        screen: {
          width: window.screen.width,
          height: window.screen.height
        }
      };

      console.log(`[Frontend Log] ${level.toUpperCase()}:`, message, metadata);

      // In a real production environment, you might send this to your backend
      // For now, we'll just store in localStorage for debugging
      this.storeLog(logEntry);

      // If we're in production and have a logging endpoint, send to backend
      if (process.env.NODE_ENV === 'production' && this.apiEndpoint) {
        // This would be implemented in a real application
        // await this.sendToBackend(logEntry);
      }
    } catch (error) {
      console.error('Failed to log:', error);
    }
  }

  storeLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('frontend_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only the last 100 logs to prevent storage bloat
      if (logs.length > 100) {
        logs.shift();
      }
      
      localStorage.setItem('frontend_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log:', error);
    }
  }

  info(message, metadata = {}) {
    this.sendLog('info', message, metadata);
  }

  warn(message, metadata = {}) {
    this.sendLog('warn', message, metadata);
  }

  error(message, metadata = {}) {
    this.sendLog('error', message, metadata);
  }

  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development') {
      this.sendLog('debug', message, metadata);
    }
  }

  // Log user actions for analytics
  logUserAction(action, details = {}) {
    this.info('User Action', {
      action,
      ...details
    });
  }

  // Log API calls
  logApiCall(method, url, status, duration, error = null) {
    this.info('API Call', {
      method,
      url,
      status,
      duration: `${duration}ms`,
      error: error ? error.message : null
    });
  }

  // Log component errors
  logComponentError(component, error, info = {}) {
    this.error('Component Error', {
      component,
      error: error.message,
      stack: error.stack,
      ...info
    });
  }

  // Log authentication events
  logAuthEvent(event, details = {}) {
    this.info('Auth Event', {
      event,
      ...details
    });
  }

  // Get stored logs
  getStoredLogs() {
    try {
      return JSON.parse(localStorage.getItem('frontend_logs') || '[]');
    } catch (error) {
      console.error('Failed to retrieve logs:', error);
      return [];
    }
  }

  // Clear stored logs
  clearStoredLogs() {
    try {
      localStorage.removeItem('frontend_logs');
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  // Export logs for debugging
  exportLogs() {
    const logs = this.getStoredLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `frontend-logs-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}

// Create singleton instance
const frontendLogger = new FrontendLogger();

// Global error handler
window.addEventListener('error', (event) => {
  frontendLogger.error('Global Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error ? event.error.message : null,
    stack: event.error ? event.error.stack : null
  });
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  frontendLogger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    message: event.reason?.message || 'Unknown reason',
    stack: event.reason?.stack || 'No stack trace'
  });
});

export default frontendLogger;