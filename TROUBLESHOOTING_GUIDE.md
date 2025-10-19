# Troubleshooting Guide

## Notification System Issues

### Problem: No notifications appearing in the notification center

#### 1. Check Browser Console
Open the browser's developer tools (F12) and check the Console tab for any JavaScript errors:
- Look for errors related to EventSource or SSE connections
- Check for network errors or CORS issues
- Look for authentication errors

#### 2. Check Network Tab
In the browser's developer tools, go to the Network tab:
- Look for requests to `/api/notifications`
- Check if the SSE connection is established
- Verify that the connection is not being blocked by CORS

#### 3. Verify User Authentication
Ensure the user is properly logged in:
- Check that `user.id` is available in the Layout component
- Verify that the authentication token is valid
- Check that the user has the correct permissions

#### 4. Test Notification Service Endpoint
Try accessing the notification endpoint directly:
```
GET http://your-domain.com/api/notifications?userId=123
```

#### 5. Clear Browser Cache
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache and cookies
- Try in an incognito/private browsing window

### Problem: Notifications disappearing after logout

#### 1. Check Notification Cleanup Logic
The notification system should preserve history across sessions:
- Verify that `handleLogoutNotifications` is called on logout
- Ensure that only local state is cleared, not the service history

#### 2. Verify Notification Service Connection
- Check that the service properly disconnects on logout
- Ensure that new connections are established on login

## User Management Issues

### Problem: Blood Group and Phone Number fields missing

#### 1. Verify Latest Code Deployment
- Ensure the latest code has been deployed to production
- Check that the deployment was successful
- Verify that the correct branch/version is running

#### 2. Check Browser Cache
- Clear browser cache and hard refresh
- Try in an incognito/private browsing window
- Check if the issue persists across different browsers

#### 3. Verify Database Schema
Run the schema verification script:
```bash
npm run verify-schema
```

#### 4. Check Component Rendering
- Verify that the UserManagement component is being loaded
- Check that there are no JavaScript errors preventing rendering
- Ensure that the user has the correct permissions (SystemAdmin)

## Database Issues

### Problem: Database schema mismatch

#### 1. Run Database Migrations
```bash
npm run migrate
```

#### 2. Verify Schema
```bash
npm run verify-schema
```

#### 3. Check Database Connection
- Verify that environment variables are correctly set
- Check database connectivity from the application
- Ensure that the database user has the correct permissions

## General Troubleshooting Steps

### 1. Check Application Logs
Look at both frontend and backend logs for error messages:
- Browser console errors
- Server logs
- Database logs

### 2. Verify Environment Variables
Ensure all required environment variables are set:
- Database connection settings
- API endpoints
- Authentication settings

### 3. Test API Endpoints
Use tools like Postman or curl to test API endpoints directly:
- Authentication endpoints
- User management endpoints
- Notification endpoints

### 4. Check Network Connectivity
- Verify that all services are accessible
- Check for firewall or network restrictions
- Test connectivity between frontend and backend

### 5. Review Recent Changes
- Check the git history for recent changes
- Verify that all changes have been properly deployed
- Look for any breaking changes that might have been introduced

## Common Solutions

### 1. Hard Refresh
- Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
- Clear browser cache and cookies

### 2. Restart Services
- Restart the application server
- Restart the database service
- Restart any caching services

### 3. Re-deploy Application
- Ensure the latest code is deployed
- Verify that the deployment was successful
- Check that all services are running correctly

### 4. Run Verification Scripts
```bash
npm run verify-user-management
npm run test-notifications
npm run verify-schema
npm run test-realtime
```

## Support

If you continue to experience issues after following these troubleshooting steps:

1. Run all verification scripts and capture the output
2. Check application logs for specific error messages
3. Provide detailed information about:
   - The exact issue you're experiencing
   - Steps to reproduce the problem
   - Environment details (browser, OS, etc.)
   - Any error messages you're seeing
4. Contact support with this information