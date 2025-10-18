// Frontend service for handling real-time notifications using Server-Sent Events
import autoRefreshService from './autoRefreshService';

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Map(); // Store event listeners
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // 1 second
    this.userId = null;
    // Add notification history to keep track of all notifications
    this.notificationHistory = [];
    this.maxHistory = 100; // Keep last 100 notifications
  }

  // Connect to the notification service
  connect(userId) {
    if (!userId) {
      console.error('User ID is required to connect to notifications');
      return;
    }

    this.userId = userId;

    // Close existing connection if any
    this.disconnect();

    // Use REACT_APP_API_URL if available, otherwise default to current origin for production
    const apiUrl = process.env.REACT_APP_API_URL || 
                  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 
                   window.location.origin);
    const url = `${apiUrl}/api/notifications?userId=${userId}`;

    try {
      console.log('Connecting to notification service at:', url);
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
          
          // Add to notification history
          this.addToHistory(data);
          
          this.emit(data.type, data);
          
          // Trigger immediate refresh for relevant data types
          this.triggerAutoRefresh(data.type);
        } catch (error) {
          console.error('Error parsing notification:', error);
          console.error('Raw data:', event.data);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Notification service error:', error);
        // Check if it's a connection error
        if (error.target.readyState === EventSource.CLOSED) {
          console.log('Connection closed, attempting to reconnect...');
        }
        this.emit('error', { error });
        
        // Attempt to reconnect
        this.handleReconnect(userId);
      };
    } catch (error) {
      console.error('Error connecting to notification service:', error);
      this.emit('error', { error });
    }
  }

  // Add notification to history
  addToHistory(notification) {
    this.notificationHistory.unshift({
      ...notification,
      id: Date.now() + Math.random(), // Unique ID for frontend
      receivedAt: new Date().toISOString()
    });
    
    // Keep only the last N notifications
    if (this.notificationHistory.length > this.maxHistory) {
      this.notificationHistory = this.notificationHistory.slice(0, this.maxHistory);
    }
  }

  // Get notification history
  getNotificationHistory() {
    return this.notificationHistory;
  }

  // Clear notification history
  clearNotificationHistory() {
    this.notificationHistory = [];
  }

  // Trigger auto-refresh based on notification type
  triggerAutoRefresh(notificationType) {
    switch (notificationType) {
      case 'taskCreated':
      case 'taskUpdated':
      case 'taskDeleted':
        autoRefreshService.triggerRefresh('tasks');
        autoRefreshService.triggerRefresh('dashboard');
        break;
      case 'leaveRequested':
      case 'leaveApproved':
      case 'leaveRejected':
        autoRefreshService.triggerRefresh('leaves');
        autoRefreshService.triggerRefresh('dashboard');
        break;
      case 'userCreated':
      case 'userUpdated':
      case 'userDeleted':
        autoRefreshService.triggerRefresh('users');
        break;
      case 'dropdownCreated':
      case 'dropdownUpdated':
      case 'dropdownDeleted':
        autoRefreshService.triggerRefresh('dropdowns');
        break;
      case 'permissionTemplateCreated':
      case 'permissionTemplateUpdated':
      case 'permissionTemplateDeleted':
        autoRefreshService.triggerRefresh('permissionTemplates');
        break;
      case 'meetingCreated':
      case 'meetingUpdated':
      case 'meetingDeleted':
        autoRefreshService.triggerRefresh('meetings');
        break;
      case 'collaborationCreated':
      case 'collaborationUpdated':
      case 'collaborationDeleted':
        autoRefreshService.triggerRefresh('collaborations');
        break;
      default:
        // For unknown notification types, trigger a general refresh
        autoRefreshService.triggerRefresh('dashboard');
        break;
    }
  }

  // Handle reconnection logic
  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // Clear previous event source
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      
      // Retry connection after delay
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

  // Listen for task deletions
  onTaskDeleted(callback) {
    this.on('taskDeleted', callback);
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

  // Listen for user creation
  onUserCreated(callback) {
    this.on('userCreated', callback);
  }

  // Listen for user updates
  onUserUpdated(callback) {
    this.on('userUpdated', callback);
  }

  // Listen for user deletions
  onUserDeleted(callback) {
    this.on('userDeleted', callback);
  }

  // Listen for dropdown creation
  onDropdownCreated(callback) {
    this.on('dropdownCreated', callback);
  }

  // Listen for dropdown updates
  onDropdownUpdated(callback) {
    this.on('dropdownUpdated', callback);
  }

  // Listen for dropdown deletions
  onDropdownDeleted(callback) {
    this.on('dropdownDeleted', callback);
  }

  // Listen for permission template creation
  onPermissionTemplateCreated(callback) {
    this.on('permissionTemplateCreated', callback);
  }

  // Listen for permission template updates
  onPermissionTemplateUpdated(callback) {
    this.on('permissionTemplateUpdated', callback);
  }

  // Listen for permission template deletions
  onPermissionTemplateDeleted(callback) {
    this.on('permissionTemplateDeleted', callback);
  }

  // Listen for meeting creation
  onMeetingCreated(callback) {
    this.on('meetingCreated', callback);
  }

  // Listen for meeting updates
  onMeetingUpdated(callback) {
    this.on('meetingUpdated', callback);
  }

  // Listen for meeting deletions
  onMeetingDeleted(callback) {
    this.on('meetingDeleted', callback);
  }

  // Listen for collaboration creation
  onCollaborationCreated(callback) {
    this.on('collaborationCreated', callback);
  }

  // Listen for collaboration updates
  onCollaborationUpdated(callback) {
    this.on('collaborationUpdated', callback);
  }

  // Listen for collaboration deletions
  onCollaborationDeleted(callback) {
    this.on('collaborationDeleted', callback);
  }

  // Listen for error monitoring notifications
  onErrorNotification(callback) {
    this.on('errorNotification', callback);
  }

  // Listen for warning notifications
  onWarningNotification(callback) {
    this.on('warningNotification', callback);
  }

  // Listen for all notifications (new unified listener)
  onAllNotifications(callback) {
    // Listen for all known notification types
    const allTypes = [
      'taskCreated', 'taskUpdated', 'taskDeleted',
      'leaveRequested', 'leaveApproved', 'leaveRejected',
      'userCreated', 'userUpdated', 'userDeleted',
      'dropdownCreated', 'dropdownUpdated', 'dropdownDeleted',
      'permissionTemplateCreated', 'permissionTemplateUpdated', 'permissionTemplateDeleted',
      'meetingCreated', 'meetingUpdated', 'meetingDeleted',
      'collaborationCreated', 'collaborationUpdated', 'collaborationDeleted',
      'errorNotification', 'warningNotification',
      'connected', 'disconnected', 'error' // Connection status events
    ];
    
    allTypes.forEach(type => {
      this.on(type, callback);
    });
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;