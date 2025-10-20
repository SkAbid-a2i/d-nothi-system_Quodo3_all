// Notification service for real-time updates using Server-Sent Events
const Notification = require('../models/Notification');

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

  // Store notification in database for persistence
  async storeNotification(notificationData) {
    try {
      // Create notification record in database
      const notification = await Notification.create({
        type: notificationData.type,
        message: notificationData.message,
        userId: notificationData.userId || null,
        recipientRole: notificationData.recipientRole || null,
        data: notificationData.data || {},
        isRead: false
      });
      
      return notification;
    } catch (error) {
      console.error('Error storing notification in database:', error);
      return null;
    }
  }

  // Get notifications for a specific user
  async getUserNotifications(userId, limit = 50) {
    try {
      // First, get the user's role
      const User = require('../models/User');
      const user = await User.findByPk(userId, {
        attributes: ['id', 'role', 'office']
      });
      
      if (!user) {
        console.error('User not found for notification retrieval:', userId);
        return [];
      }
      
      const notifications = await Notification.findAll({
        where: {
          [require('sequelize').Op.or]: [
            { userId: userId }, // Direct notifications to this user
            { userId: null }, // Broadcast notifications (null userId means broadcast)
            // Role-based notifications
            { recipientRole: user.role },
            // For office-based notifications, we can add this later if needed
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: limit
      });
      
      return notifications;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return [];
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          id: notificationId,
          [require('sequelize').Op.or]: [
            { userId: userId },
            { userId: null },
            { recipientRole: require('sequelize').literal(`EXISTS (SELECT 1 FROM Users WHERE Users.id = ${userId} AND Users.role = Notification.recipientRole)`) }
          ]
        }
      });
      
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Clear user notifications (soft delete)
  async clearUserNotifications(userId) {
    try {
      // Instead of deleting, mark as read
      await Notification.update(
        { isRead: true, readAt: new Date() },
        {
          where: {
            userId: userId,
            isRead: false
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error clearing user notifications:', error);
      return false;
    }
  }

  // Notify about task creation
  async notifyTaskCreated(task) {
    const notification = {
      type: 'taskCreated',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'taskCreated',
      message: `New task created: ${task.description || 'No description'}`,
      userId: null, // Broadcast to all relevant users
      data: notification
    });
    
    // Send to all users (broadcast)
    this.broadcast(notification);
  }

  // Notify about task update
  async notifyTaskUpdated(task) {
    const notification = {
      type: 'taskUpdated',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'taskUpdated',
      message: `Task updated: ${task.description || 'No description'}`,
      userId: null, // Broadcast to all relevant users
      data: notification
    });
    
    // Send to all users (broadcast)
    this.broadcast(notification);
  }

  // Notify about task deletion
  async notifyTaskDeleted(task) {
    const notification = {
      type: 'taskDeleted',
      taskId: task.id,
      task: task,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'taskDeleted',
      message: `Task deleted: ${task.description || 'No description'}`,
      userId: null, // Broadcast to all relevant users
      data: notification
    });
    
    // Send to all users (broadcast)
    this.broadcast(notification);
  }

  // Notify about leave request
  async notifyLeaveRequested(leave) {
    const notification = {
      type: 'leaveRequested',
      leaveId: leave.id,
      leave: leave,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'leaveRequested',
      message: `New leave request from ${leave.userName || leave.userId || 'Unknown user'}`,
      userId: null, // Broadcast to office
      recipientRole: 'Admin', // Also send to Admin role
      data: notification
    });
    
    // Send to admins/supervisors in the same office
    this.sendToOffice(leave.office, notification);
  }

  // Notify about leave approval
  async notifyLeaveApproved(leave) {
    const notification = {
      type: 'leaveApproved',
      leaveId: leave.id,
      leave: leave,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'leaveApproved',
      message: `Leave request approved for ${leave.userName || leave.userId || 'Unknown user'}`,
      userId: leave.userId, // Send to specific user
      data: notification
    });
    
    // Send to the employee who requested the leave
    this.sendToUser(leave.userId, notification);
  }

  // Notify about leave rejection
  async notifyLeaveRejected(leave) {
    const notification = {
      type: 'leaveRejected',
      leaveId: leave.id,
      leave: leave,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'leaveRejected',
      message: `Leave request rejected for ${leave.userName || leave.userId || 'Unknown user'}`,
      userId: leave.userId, // Send to specific user
      data: notification
    });
    
    // Send to the employee who requested the leave
    this.sendToUser(leave.userId, notification);
  }

  // Notify about user creation
  async notifyUserCreated(user) {
    const notification = {
      type: 'userCreated',
      userId: user.id,
      user: user,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'userCreated',
      message: `New user created: ${user.username || user.fullName || 'Unknown user'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about user update
  async notifyUserUpdated(user) {
    const notification = {
      type: 'userUpdated',
      userId: user.id,
      user: user,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'userUpdated',
      message: `User updated: ${user.username || user.fullName || 'Unknown user'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about user deletion
  async notifyUserDeleted(user) {
    const notification = {
      type: 'userDeleted',
      userId: user.id,
      username: user.username,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'userDeleted',
      message: `User deleted: ${user.username || user.userId || 'Unknown user'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about dropdown creation
  async notifyDropdownCreated(dropdown) {
    const notification = {
      type: 'dropdownCreated',
      dropdownId: dropdown.id,
      dropdown: dropdown,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'dropdownCreated',
      message: `New dropdown value created: ${dropdown.value || 'Unknown value'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about dropdown update
  async notifyDropdownUpdated(dropdown) {
    const notification = {
      type: 'dropdownUpdated',
      dropdownId: dropdown.id,
      dropdown: dropdown,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'dropdownUpdated',
      message: `Dropdown value updated: ${dropdown.value || 'Unknown value'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about dropdown deletion
  async notifyDropdownDeleted(dropdown) {
    const notification = {
      type: 'dropdownDeleted',
      dropdownId: dropdown.id,
      dropdownValue: dropdown.value,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'dropdownDeleted',
      message: `Dropdown value deleted: ${dropdown.value || 'Unknown value'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about permission template creation
  async notifyPermissionTemplateCreated(template) {
    const notification = {
      type: 'permissionTemplateCreated',
      templateId: template.id,
      template: template,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'permissionTemplateCreated',
      message: `New permission template created: ${template.name || 'Unknown template'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about permission template update
  async notifyPermissionTemplateUpdated(template) {
    const notification = {
      type: 'permissionTemplateUpdated',
      templateId: template.id,
      template: template,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'permissionTemplateUpdated',
      message: `Permission template updated: ${template.name || 'Unknown template'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about permission template deletion
  async notifyPermissionTemplateDeleted(template) {
    const notification = {
      type: 'permissionTemplateDeleted',
      templateId: template.id,
      templateName: template.name,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'permissionTemplateDeleted',
      message: `Permission template deleted: ${template.name || 'Unknown template'}`,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admins
    this.sendToAdminUsers(notification);
  }

  // Notify about meeting creation
  async notifyMeetingCreated(meeting) {
    const notification = {
      type: 'meetingCreated',
      meetingId: meeting.id,
      meeting: meeting,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'meetingCreated',
      message: `New meeting scheduled: ${meeting.subject || 'No subject'}`,
      userId: null, // Will be sent to relevant users
      data: notification
    });
    
    // Send to selected users and Admin roles
    this.sendToRelevantUsersForMeeting(meeting, notification);
  }

  // Notify about meeting update
  async notifyMeetingUpdated(meeting) {
    const notification = {
      type: 'meetingUpdated',
      meetingId: meeting.id,
      meeting: meeting,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'meetingUpdated',
      message: `Meeting updated: ${meeting.subject || 'No subject'}`,
      userId: null, // Will be sent to relevant users
      data: notification
    });
    
    // Send to selected users and Admin roles
    this.sendToRelevantUsersForMeeting(meeting, notification);
  }

  // Notify about meeting deletion
  async notifyMeetingDeleted(meeting) {
    const notification = {
      type: 'meetingDeleted',
      meetingId: meeting.id,
      meeting: meeting,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'meetingDeleted',
      message: `Meeting cancelled: ${meeting.subject || 'No subject'}`,
      userId: null, // Will be sent to relevant users
      data: notification
    });
    
    // Send to selected users and Admin roles
    this.sendToRelevantUsersForMeeting(meeting, notification);
  }

  // Notify about collaboration creation
  async notifyCollaborationCreated(collaboration) {
    const notification = {
      type: 'collaborationCreated',
      collaborationId: collaboration.id,
      collaboration: collaboration,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'collaborationCreated',
      message: `New collaboration link created: ${collaboration.title || 'No title'}`,
      userId: collaboration.createdBy, // Send to creator
      data: notification
    });
    
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
  async notifyCollaborationUpdated(collaboration) {
    const notification = {
      type: 'collaborationUpdated',
      collaborationId: collaboration.id,
      collaboration: collaboration,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'collaborationUpdated',
      message: `Collaboration link updated: ${collaboration.title || 'No title'}`,
      userId: collaboration.createdBy, // Send to creator
      data: notification
    });
    
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
  async notifyCollaborationDeleted(collaboration) {
    const notification = {
      type: 'collaborationDeleted',
      collaborationId: collaboration.id,
      collaboration: collaboration,
      timestamp: new Date().toISOString()
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'collaborationDeleted',
      message: `Collaboration link deleted: ${collaboration.title || 'No title'}`,
      userId: collaboration.createdBy, // Send to creator
      data: notification
    });
    
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
  async notifyError(errorData) {
    const notification = {
      type: 'errorNotification',
      message: errorData.message,
      timestamp: new Date().toISOString(),
      metadata: errorData.metadata || {}
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'errorNotification',
      message: errorData.message,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
    // Send to all admin users
    this.sendToAdminUsers(notification);
  }

  // Notify about warning
  async notifyWarning(warningData) {
    const notification = {
      type: 'warningNotification',
      message: warningData.message,
      timestamp: new Date().toISOString(),
      metadata: warningData.metadata || {}
    };
    
    // Store in database for persistence
    await this.storeNotification({
      type: 'warningNotification',
      message: warningData.message,
      userId: null,
      recipientRole: 'SystemAdmin', // Send to SystemAdmin role
      data: notification
    });
    
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