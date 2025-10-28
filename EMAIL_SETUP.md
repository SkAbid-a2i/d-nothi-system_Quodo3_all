# Email Notification Setup Guide

## Overview
This guide explains how to configure email notifications for the D-Nothi Team & Activity Management System.

## Prerequisites
- SMTP server credentials (Gmail, Outlook, etc.)
- Email account with app password (for Gmail)
- Environment variables configuration

## Configuration

### Environment Variables
Add the following variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=D-Nothi Team & Activity Management <no-reply@d-nothi.com>
```

### Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated app password as `EMAIL_PASS`

### Other Email Providers
For other providers, update the following variables accordingly:

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Custom SMTP Server
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## Testing Email Configuration

### Backend Test
Run the following command to test email configuration:

```bash
npm run test-email
```

### Manual Test
1. Start the application
2. Submit a leave request
3. Check if email notifications are sent to admins/supervisors
4. Approve/reject the leave request
5. Check if email notifications are sent to the employee

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure EMAIL_USER and EMAIL_PASS are correct
   - For Gmail, use App Password instead of regular password
   - Check if 2-Factor Authentication is enabled

2. **Connection Timeout**
   - Verify EMAIL_HOST and EMAIL_PORT
   - Check firewall settings
   - Ensure internet connectivity

3. **Email Not Received**
   - Check spam/junk folder
   - Verify recipient email addresses
   - Check email service logs

### Log Files
Check the following log files for email-related errors:
- Server logs (`logs/server.log`)
- Error logs (`logs/error.log`)

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different credentials for development and production

2. **App Passwords**
   - Generate separate app passwords for different services
   - Regularly rotate app passwords

3. **Rate Limiting**
   - Implement rate limiting to prevent email spam
   - Monitor email sending frequency

## Customization

### Email Templates
Email templates can be customized in `config/email.config.js`:

```javascript
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
  }
}
```

### Adding New Email Types
To add new email notification types:

1. Add template to `config/email.config.js`
2. Add function to `services/email.service.js`
3. Call the function from appropriate routes

## Monitoring

### Email Delivery Tracking
- Monitor email delivery rates
- Track bounce rates
- Log email sending failures

### Performance Metrics
- Email sending latency
- Queue processing time
- Retry attempts

## Backup and Recovery

### Configuration Backup
- Regularly backup `.env` files
- Store backups in secure location
- Encrypt sensitive configuration data

### Email Service Recovery
- Implement fallback email service
- Retry failed email sends
- Alert on persistent email failures

## Integration with Other Services

### Slack Notifications
Optionally integrate with Slack for critical notifications:

```javascript
// Add to email service
sendSlackNotification: async (message) => {
  // Implementation for Slack webhook
}
```

### SMS Notifications
For urgent notifications, integrate with SMS services:

```javascript
// Add to email service
sendSMS: async (phoneNumber, message) => {
  // Implementation for SMS service
}
```

## Conclusion
The email notification system is now properly configured and ready for use. Regular monitoring and maintenance will ensure reliable delivery of notifications.