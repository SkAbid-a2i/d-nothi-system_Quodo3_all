const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

// Create transporter only if email configuration is provided
let transporter = null;
let isEmailConfigured = false;

// Check if email configuration is provided
if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport(emailConfig.smtp);
  isEmailConfigured = true;
  
  // Verify transporter configuration
  transporter.verify((error, success) => {
    if (error) {
      console.log('Email transporter configuration error:', error);
      isEmailConfigured = false;
    } else {
      console.log('Email transporter is ready to send messages');
    }
  });
} else {
  console.log('Email service not configured - skipping email transporter setup');
}

// Email service functions
const emailService = {
  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.html - HTML body
   * @param {string} options.text - Text body (optional)
   * @returns {Promise} - Email sending promise
   */
  sendEmail: async (options) => {
    // If email is not configured, just log and return
    if (!isEmailConfigured) {
      console.log('Email service not configured, skipping email send');
      return { messageId: 'email-not-configured' };
    }
    
    try {
      const mailOptions = {
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  /**
   * Send leave request notification to admin/supervisor
   * @param {Object} leaveData - Leave request data
   * @param {string} adminEmail - Admin email
   * @returns {Promise} - Email sending promise
   */
  sendLeaveRequestNotification: async (leaveData, adminEmail) => {
    // If email is not configured, just log and return
    if (!isEmailConfigured) {
      console.log('Email service not configured, skipping leave request notification');
      return { messageId: 'email-not-configured' };
    }
    
    try {
      const template = emailConfig.templates.leaveRequest;
      const htmlBody = template.body
        .replace('{employeeName}', leaveData.employeeName)
        .replace('{startDate}', new Date(leaveData.startDate).toLocaleDateString())
        .replace('{endDate}', new Date(leaveData.endDate).toLocaleDateString())
        .replace('{reason}', leaveData.reason);

      return await emailService.sendEmail({
        to: adminEmail,
        subject: template.subject,
        html: htmlBody
      });
    } catch (error) {
      console.error('Error sending leave request notification:', error);
      throw error;
    }
  },

  /**
   * Send leave approval notification to employee
   * @param {Object} leaveData - Leave request data
   * @param {string} employeeEmail - Employee email
   * @returns {Promise} - Email sending promise
   */
  sendLeaveApprovalNotification: async (leaveData, employeeEmail) => {
    // If email is not configured, just log and return
    if (!isEmailConfigured) {
      console.log('Email service not configured, skipping leave approval notification');
      return { messageId: 'email-not-configured' };
    }
    
    try {
      const template = emailConfig.templates.leaveApproved;
      const htmlBody = template.body
        .replace('{startDate}', new Date(leaveData.startDate).toLocaleDateString())
        .replace('{endDate}', new Date(leaveData.endDate).toLocaleDateString())
        .replace('{approverName}', leaveData.approverName);

      return await emailService.sendEmail({
        to: employeeEmail,
        subject: template.subject,
        html: htmlBody
      });
    } catch (error) {
      console.error('Error sending leave approval notification:', error);
      throw error;
    }
  },

  /**
   * Send leave rejection notification to employee
   * @param {Object} leaveData - Leave request data
   * @param {string} employeeEmail - Employee email
   * @returns {Promise} - Email sending promise
   */
  sendLeaveRejectionNotification: async (leaveData, employeeEmail) => {
    // If email is not configured, just log and return
    if (!isEmailConfigured) {
      console.log('Email service not configured, skipping leave rejection notification');
      return { messageId: 'email-not-configured' };
    }
    
    try {
      const template = emailConfig.templates.leaveRejected;
      const htmlBody = template.body
        .replace('{startDate}', new Date(leaveData.startDate).toLocaleDateString())
        .replace('{endDate}', new Date(leaveData.endDate).toLocaleDateString())
        .replace('{rejecterName}', leaveData.rejecterName)
        .replace('{rejectionReason}', leaveData.rejectionReason);

      return await emailService.sendEmail({
        to: employeeEmail,
        subject: template.subject,
        html: htmlBody
      });
    } catch (error) {
      console.error('Error sending leave rejection notification:', error);
      throw error;
    }
  },
  
  /**
   * Check if email service is configured
   * @returns {boolean} - Whether email service is configured
   */
  isConfigured: () => isEmailConfigured
};

module.exports = emailService;