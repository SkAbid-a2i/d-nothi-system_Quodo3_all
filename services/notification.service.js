// Notification service for real-time updates using Server-Sent Events
class NotificationService {
  constructor() {
    this.clients = new Map(); // Store connected clients
  }

  // Add a client to the notification service
  addClient(userId, response) {
    // Set headers for SSE with proper CORS
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'X-Accel-Buffering': 'no' // Disable buffering for nginx
    });

    // Send initial connection message
    response.write(`data: ${JSON.stringify({ type: 'connected', message: 'Connected to notification service' })}\n\n`);

    // Store client connection
    this.clients.set(userId, response);

    // Handle client disconnect
    response.on('close', () => {
      this.removeClient(userId);
    });
  }

  // Remove a client from the notification service
  removeClient(userId) {
    this.clients.delete(userId);
  }

  // Send notification to a specific user
  sendToUser(userId, data) {
    const client = this.clients.get(userId);
    if (client) {
      try {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('Error sending notification to user:', userId, error);
        this.removeClient(userId);
      }
    }
  }

  // Send notification to all users in an office
  sendToOffice(office, data) {
    // In a real implementation, you would track which users belong to which office
    // For now, we'll send to all connected clients
    this.broadcast(data);
  }

  // Send notification to all connected clients
  broadcast(data) {
    this.clients.forEach((client, userId) => {
      try {
        client.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error('Error sending notification to user:', userId, error);
        this.removeClient(userId);
      }
    });
  }

  // Notify about task creation
  notifyTaskCreated(task) {
    const notification = {
      type: 'taskCreated',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Send to all users (in a real app, you'd send only to relevant users)
    this.broadcast(notification);
  }

  // Notify about task update
  notifyTaskUpdated(task) {
    const notification = {
      type: 'taskUpdated',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Send to all users (in a real app, you'd send only to relevant users)
    this.broadcast(notification);
  }

  // Notify about leave request
  notifyLeaveRequested(leave) {
    const notification = {
      type: 'leaveRequested',
      leaveId: leave.id,
      leave: leave,
      timestamp: new Date().toISOString()
    };
    
    // Send to admins/supervisors in the same office
    this.sendToOffice(leave.office, notification);
  }

  // Notify about leave approval
  notifyLeaveApproved(leave) {
    const notification = {
      type: 'leaveApproved',
      leaveId: leave.id,
      leave: leave,
      timestamp: new Date().toISOString()
    };
    
    // Send to the employee who requested the leave
    this.sendToUser(leave.userId, notification);
  }

  // Notify about leave rejection
  notifyLeaveRejected(leave) {
    const notification = {
      type: 'leaveRejected',
      leaveId: leave.id,
      leave: leave,
      timestamp: new Date().toISOString()
    };
    
    // Send to the employee who requested the leave
    this.sendToUser(leave.userId, notification);
  }

  // Get number of connected clients
  getConnectedClients() {
    return this.clients.size;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;