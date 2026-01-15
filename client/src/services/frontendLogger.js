// Frontend logger service for tracking client-side errors and user interactions
class FrontendLogger {
  constructor() {
    this.apiEndpoint = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.isSending = false;
    this.pendingLogs = [];
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  setUserId(userId) {
    this.userId = userId;
  }

  async sendLog(level, message, metadata = {}) {
    try {
      // Create log entry
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

      // Store in localStorage for debugging
      this.storeLog(logEntry);

      // Send to backend in production
      if (process.env.NODE_ENV === 'production' && this.apiEndpoint) {
        await this.sendToBackend(logEntry);
      } else if (this.apiEndpoint) {
        // Also send in development for testing
        await this.sendToBackend(logEntry);
      }
    } catch (error) {
      console.error('Failed to log:', error);
    }
  }

  async sendToBackend(logEntry) {
    try {
      // Add to pending logs
      this.pendingLogs.push(logEntry);
      
      // If already sending, return
      if (this.isSending) return;
      
      this.isSending = true;
      
      // Send all pending logs
      while (this.pendingLogs.length > 0) {
        const logToSend = this.pendingLogs[0];
        const response = await fetch(`${this.apiEndpoint}/logs/frontend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(logToSend)
        });
        
        if (response.ok) {
          // Remove successfully sent log
          this.pendingLogs.shift();
        } else {
          // If failed, wait before retrying
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    } finally {
      this.isSending = false;
    }
  }

  storeLog(logEntry) {
    // Do not store logs in localStorage to comply with production standards
    // Logs should only be sent to backend for persistence
    try {
      // Send log directly to backend instead of storing in localStorage
      this.sendToBackend(logEntry);
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

  // Log field visibility issues
  logFieldIssue(field, issue, details = {}) {
    this.warn('Field Issue', {
      field,
      issue,
      ...details
    });
  }

  // Log API errors
  logApiError(url, error, details = {}) {
    this.error('API Error', {
      url,
      error: error.message,
      stack: error.stack,
      ...details
    });
  }

  // Get stored logs
  getStoredLogs() {
    // Return empty array as logs are now only stored on backend
    return [];
  }

  // Clear stored logs
  clearStoredLogs() {
    // No-op as logs are not stored in localStorage anymore
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

// Monitor DOM changes for field visibility tracking
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check for elements that might be fields
          const fields = node.querySelectorAll('input, select, textarea');
          fields.forEach((field) => {
            if (!field.offsetParent && field.style.display !== 'none') {
              // Field is not visible but should be
              frontendLogger.warn('Field Visibility Issue', {
                field: field.name || field.id || field.className,
                message: 'Field is not visible in UI'
              });
            }
          });
        }
      });
    }
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

export default frontendLogger;