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

  // Send notification to relevant users for a meeting
  async sendToRelevantUsersForMeeting(meeting, data) {
    try {
      // Get the meeting with selected users
      const Meeting = require('../models/Meeting');
      const User = require('../models/User');
      
      const fullMeeting = await Meeting.findByPk(meeting.id, {
        include: [{
          model: User,
          as: 'selectedUsers',
          attributes: ['id'],
          through: { attributes: [] }
        }]
      });
      
      // Get selected user IDs from both sources (JSON field and association table)
      let selectedUserIds = [];
      
      // From JSON field
      if (meeting.selectedUserIds && Array.isArray(meeting.selectedUserIds)) {
        selectedUserIds = [...selectedUserIds, ...meeting.selectedUserIds];
      }
      
      // From association table
      if (fullMeeting && fullMeeting.selectedUsers) {
        const associationUserIds = fullMeeting.selectedUsers.map(user => user.id);
        selectedUserIds = [...selectedUserIds, ...associationUserIds];
      }
      
      // Add creator to the list
      if (meeting.createdBy && !selectedUserIds.includes(meeting.createdBy)) {
        selectedUserIds.push(meeting.createdBy);
      }
      
      // Remove duplicates
      selectedUserIds = [...new Set(selectedUserIds)];
      
      // Add Admin, SystemAdmin, and Supervisor users (they should receive all meeting notifications)
      const adminUsers = await User.findAll({
        where: {
          role: {
            [require('sequelize').Op.in]: ['Admin', 'SystemAdmin', 'Supervisor']
          }
        },
        attributes: ['id']
      });
      
      const adminUserIds = adminUsers.map(user => user.id);
      
      // Combine all relevant user IDs
      const relevantUserIds = [...new Set([...selectedUserIds, ...adminUserIds])];
      
      // Send to relevant users only
      if (relevantUserIds.length > 0) {
        relevantUserIds.forEach(userId => {
          this.sendToUser(userId, data);
        });
      } else {
        // Fallback to broadcast if no specific users
        this.broadcast(data);
      }
    } catch (error) {
      console.error('Error sending meeting notification to relevant users:', error);
      // Fallback to broadcast if there's an error
      this.broadcast(data);
    }
  }

  // Send notification to all admin users (SystemAdmin, Admin, Supervisor)
  async sendToAdminUsers(data) {
    try {
      const User = require('../models/User');
      
      // Get all admin users
      const adminUsers = await User.findAll({
        where: {
          role: {
            [require('sequelize').Op.in]: ['SystemAdmin', 'Admin', 'Supervisor']
          }
        },
        attributes: ['id']
      });
      
      // Send notification to each admin user
      adminUsers.forEach(user => {
        this.sendToUser(user.id, data);
      });
    } catch (error) {
      console.error('Error sending notification to admin users:', error);
      // Fallback to broadcast if there's an error
      this.broadcast(data);
    }
  }

  // Notify about task creation
  notifyTaskCreated(task) {
    const notification = {
      type: 'taskCreated',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Send to all users
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
    
    // Send to all users
    this.broadcast(notification);
  }

  // Notify about task deletion
  notifyTaskDeleted(task) {
    const notification = {
      type: 'taskDeleted',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Send to all users
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

  // Notify about user creation
  notifyUserCreated(user) {
    const notification = {
      type: 'userCreated',
      userId: user.id,
      user: user,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about user update
  notifyUserUpdated(user) {
    const notification = {
      type: 'userUpdated',
      userId: user.id,
      user: user,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about user deletion
  notifyUserDeleted(user) {
    const notification = {
      type: 'userDeleted',
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about dropdown creation
  notifyDropdownCreated(dropdown) {
    const notification = {
      type: 'dropdownCreated',
      dropdownId: dropdown.id,
      dropdown: dropdown,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about dropdown update
  notifyDropdownUpdated(dropdown) {
    const notification = {
      type: 'dropdownUpdated',
      dropdownId: dropdown.id,
      dropdown: dropdown,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about dropdown deletion
  notifyDropdownDeleted(dropdown) {
    const notification = {
      type: 'dropdownDeleted',
      dropdownId: dropdown.id,
      dropdownValue: dropdown.value,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about permission template creation
  notifyPermissionTemplateCreated(template) {
    const notification = {
      type: 'permissionTemplateCreated',
      templateId: template.id,
      template: template,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about permission template update
  notifyPermissionTemplateUpdated(template) {
    const notification = {
      type: 'permissionTemplateUpdated',
      templateId: template.id,
      template: template,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about permission template deletion
  notifyPermissionTemplateDeleted(template) {
    const notification = {
      type: 'permissionTemplateDeleted',
      templateId: template.id,
      templateName: template.name,
      timestamp: new Date().toISOString()
    };
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about meeting creation
  notifyMeetingCreated(meeting) {
    const notification = {
      type: 'meetingCreated',
      meetingId: meeting.id,
      meeting: meeting,
      timestamp: new Date().toISOString()
    };
    
    // Send to selected users and Admin roles
    this.sendToRelevantUsersForMeeting(meeting, notification);
  }

  // Notify about meeting update
  notifyMeetingUpdated(meeting) {
    const notification = {
      type: 'meetingUpdated',
      meetingId: meeting.id,
      meeting: meeting,
      timestamp: new Date().toISOString()
    };
    
    // Send to selected users and Admin roles
    this.sendToRelevantUsersForMeeting(meeting, notification);
  }

  // Notify about meeting deletion
  notifyMeetingDeleted(meeting) {
    const notification = {
      type: 'meetingDeleted',
      meetingId: meeting.id,
      meeting: meeting,
      timestamp: new Date().toISOString()
    };
    
    // Send to selected users and Admin roles
    this.sendToRelevantUsersForMeeting(meeting, notification);
  }

  // Notify about collaboration creation
  notifyCollaborationCreated(collaboration) {
    const notification = {
      type: 'collaborationCreated',
      collaborationId: collaboration.id,
      collaboration: collaboration,
      timestamp: new Date().toISOString()
    };
    
    // Send to the creator and all users in the same office
    this.sendToUser(collaboration.createdBy, notification);
    
    if (collaboration.office) {
      this.sendToOffice(collaboration.office, notification);
    } else {
      // Fallback to broadcast if no office specified
      this.broadcast(notification);
    }
  }

  // Notify about collaboration update
  notifyCollaborationUpdated(collaboration) {
    const notification = {
      type: 'collaborationUpdated',
      collaborationId: collaboration.id,
      collaboration: collaboration,
      timestamp: new Date().toISOString()
    };
    
    // Send to the creator and all users in the same office
    this.sendToUser(collaboration.createdBy, notification);
    
    if (collaboration.office) {
      this.sendToOffice(collaboration.office, notification);
    } else {
      // Fallback to broadcast if no office specified
      this.broadcast(notification);
    }
  }

  // Notify about collaboration deletion
  notifyCollaborationDeleted(collaboration) {
    const notification = {
      type: 'collaborationDeleted',
      collaborationId: collaboration.id,
      collaboration: collaboration,
      timestamp: new Date().toISOString()
    };
    
    // Send to the creator and all users in the same office
    this.sendToUser(collaboration.createdBy, notification);
    
    if (collaboration.office) {
      this.sendToOffice(collaboration.office, notification);
    } else {
      // Fallback to broadcast if no office specified
      this.broadcast(notification);
    }
  }

  // Notify about error
  notifyError(errorData) {
    const notification = {
      type: 'errorNotification',
      message: errorData.message,
      timestamp: new Date().toISOString(),
      metadata: errorData.metadata || {}
    };
    
    // Send to all admin users
    this.sendToAdminUsers(notification);
  }

  // Notify about warning
  notifyWarning(warningData) {
    const notification = {
      type: 'warningNotification',
      message: warningData.message,
      timestamp: new Date().toISOString(),
      metadata: warningData.metadata || {}
    };
    
    // Send to all admin users
    this.sendToAdminUsers(notification);
  }

  // Get number of connected clients
  getConnectedClients() {
    return this.clients.size;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;