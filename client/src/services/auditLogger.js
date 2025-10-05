import { auditAPI } from './api';

// Utility function to create audit logs
export const createAuditLog = async (action, resourceType, details = {}) => {
  try {
    const logData = {
      action,
      resourceType,
      ...details
    };
    
    // Create audit log entry
    await auditAPI.createLog(logData);
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // We don't want audit logging failures to break the main functionality
  }
};

// Predefined audit log functions for common actions
export const auditLog = {
  // User actions
  userLogin: (userId, username) => 
    createAuditLog('LOGIN', 'USER', { 
      resourceId: userId, 
      description: `User ${username} logged in` 
    }),
    
  userLogout: (userId, username) => 
    createAuditLog('LOGOUT', 'USER', { 
      resourceId: userId, 
      description: `User ${username} logged out` 
    }),
    
  userCreated: (userId, creator) => 
    createAuditLog('CREATE', 'USER', { 
      resourceId: userId, 
      description: `User created by ${creator}` 
    }),
    
  userUpdated: (userId, updater) => 
    createAuditLog('UPDATE', 'USER', { 
      resourceId: userId, 
      description: `User updated by ${updater}` 
    }),
    
  userDeleted: (userId, deleter) => 
    createAuditLog('DELETE', 'USER', { 
      resourceId: userId, 
      description: `User deleted by ${deleter}` 
    }),
    
  userRoleChanged: (userId, oldRole, newRole, changer) => 
    createAuditLog('ROLE_CHANGE', 'USER', { 
      resourceId: userId, 
      description: `User role changed from ${oldRole} to ${newRole} by ${changer}` 
    }),
    
  // Task actions
  taskCreated: (taskId, creator) => 
    createAuditLog('CREATE', 'TASK', { 
      resourceId: taskId, 
      description: `Task created by ${creator}` 
    }),
    
  taskUpdated: (taskId, updater) => 
    createAuditLog('UPDATE', 'TASK', { 
      resourceId: taskId, 
      description: `Task updated by ${updater}` 
    }),
    
  taskDeleted: (taskId, deleter) => 
    createAuditLog('DELETE', 'TASK', { 
      resourceId: taskId, 
      description: `Task deleted by ${deleter}` 
    }),
    
  // Leave actions
  leaveCreated: (leaveId, creator) => 
    createAuditLog('CREATE', 'LEAVE', { 
      resourceId: leaveId, 
      description: `Leave request created by ${creator}` 
    }),
    
  leaveFetched: (count, fetcher) => 
    createAuditLog('FETCH', 'LEAVE', { 
      description: `Leave requests fetched by ${fetcher}. Total: ${count}` 
    }),
    
  leaveApproved: (leaveId, approver) => 
    createAuditLog('APPROVE', 'LEAVE', { 
      resourceId: leaveId, 
      description: `Leave request approved by ${approver}` 
    }),
    
  leaveRejected: (leaveId, rejecter, reason) => 
    createAuditLog('REJECT', 'LEAVE', { 
      resourceId: leaveId, 
      description: `Leave request rejected by ${rejecter}. Reason: ${reason}` 
    }),
    
  leaveDeleted: (leaveId, deleter) => 
    createAuditLog('DELETE', 'LEAVE', { 
      resourceId: leaveId, 
      description: `Leave request deleted by ${deleter}` 
    }),
    
  // Dropdown actions
  dropdownCreated: (dropdownId, creator, type) => 
    createAuditLog('CREATE', 'DROPDOWN', { 
      resourceId: dropdownId, 
      description: `Dropdown ${type} created by ${creator}` 
    }),
    
  dropdownUpdated: (dropdownId, updater, type) => 
    createAuditLog('UPDATE', 'DROPDOWN', { 
      resourceId: dropdownId, 
      description: `Dropdown ${type} updated by ${updater}` 
    }),
    
  dropdownDeleted: (dropdownId, deleter, type) => 
    createAuditLog('DELETE', 'DROPDOWN', { 
      resourceId: dropdownId, 
      description: `Dropdown ${type} deleted by ${deleter}` 
    }),
    
  // Report actions
  reportExported: (reportType, format, exporter) => 
    createAuditLog('EXPORT', 'REPORT', { 
      description: `Report ${reportType} exported as ${format} by ${exporter}` 
    }),
    
  // File actions
  fileUploaded: (fileName, uploader, size) => 
    createAuditLog('UPLOAD', 'FILE', { 
      description: `File ${fileName} (${size}) uploaded by ${uploader}` 
    }),
    
  fileDownloaded: (fileName, downloader) => 
    createAuditLog('DOWNLOAD', 'FILE', { 
      description: `File ${fileName} downloaded by ${downloader}` 
    }),
    
  fileDeleted: (fileName, deleter) => 
    createAuditLog('DELETE', 'FILE', { 
      description: `File ${fileName} deleted by ${deleter}` 
    })
};

export default auditLog;


