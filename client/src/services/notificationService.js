// Frontend service for handling real-time notifications using Server-Sent Events
class NotificationService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map(); // Store event listeners
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 second
  }

  // Connect to the notification service
  connect(userId) {
    if (!userId) {
      console.error('User ID is required to connect to notifications');
      return;
    }

    // Close existing connection if any
    this.disconnect();

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    const url = `${apiUrl}/notifications?userId=${userId}`;

    try {
      this.eventSource = new EventSource(url);
      
      this.eventSource.onopen = () => {
        console.log('Connected to notification service');
        this.reconnectAttempts = 0;
        this.emit('connected', { message: 'Connected to notification service' });
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received notification:', data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Notification service error:', error);
        this.emit('error', { error });
        
        // Attempt to reconnect
        this.handleReconnect(userId);
      };
    } catch (error) {
      console.error('Error connecting to notification service:', error);
      this.emit('error', { error });
    }
  }

  // Handle reconnection logic
  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(userId);
      }, this.reconnectDelay * this.reconnectAttempts); // Exponential backoff
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('disconnected', { reason: 'Max reconnection attempts reached' });
    }
  }

  // Disconnect from the notification service
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log('Disconnected from notification service');
      this.emit('disconnected', { reason: 'Manual disconnect' });
    }
  }

  // Add event listener
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  // Remove event listener
  off(eventType, callback) {
    if (this.listeners.has(eventType)) {
      const callbacks = this.listeners.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to all listeners
  emit(eventType, data) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }
  }

  // Listen for task creation
  onTaskCreated(callback) {
    this.on('taskCreated', callback);
  }

  // Listen for task updates
  onTaskUpdated(callback) {
    this.on('taskUpdated', callback);
  }

  // Listen for leave requests
  onLeaveRequested(callback) {
    this.on('leaveRequested', callback);
  }

  // Listen for leave approvals
  onLeaveApproved(callback) {
    this.on('leaveApproved', callback);
  }

  // Listen for leave rejections
  onLeaveRejected(callback) {
    this.on('leaveRejected', callback);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;