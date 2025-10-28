// Email configuration (Optional - emails will be skipped if not configured)
module.exports = {
  // SMTP configuration
  smtp: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  },
  
  // Default sender
  from: process.env.EMAIL_FROM || 'D-Nothi Team & Activity Management <no-reply@d-nothi.com>',
  
  // Email templates
  templates: {
    leaveRequest: {
      subject: 'New Leave Request Submitted',
      body: `
        <h2>Leave Request Notification</h2>
        <p>A new leave request has been submitted:</p>
        <ul>
          <li><strong>Employee:</strong> {employeeName}</li>
          <li><strong>Dates:</strong> {startDate} to {endDate}</li>
          <li><strong>Reason:</strong> {reason}</li>
        </ul>
        <p>Please review this request in the system.</p>
      `
    },
    
    leaveApproved: {
      subject: 'Leave Request Approved',
      body: `
        <h2>Leave Request Approved</h2>
        <p>Your leave request has been approved:</p>
        <ul>
          <li><strong>Dates:</strong> {startDate} to {endDate}</li>
          <li><strong>Approved by:</strong> {approverName}</li>
        </ul>
      `
    },
    
    leaveRejected: {
      subject: 'Leave Request Rejected',
      body: `
        <h2>Leave Request Rejected</h2>
        <p>Your leave request has been rejected:</p>
        <ul>
          <li><strong>Dates:</strong> {startDate} to {endDate}</li>
          <li><strong>Rejected by:</strong> {rejecterName}</li>
          <li><strong>Reason:</strong> {rejectionReason}</li>
        </ul>
      `
    }
  }
};