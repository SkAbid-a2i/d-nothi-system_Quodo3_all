import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import notificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

const NotificationTest = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (user && user.id) {
      // Connect to notification service
      notificationService.connect(user.id);
      
      // Handle all notifications
      const handleNotification = (data) => {
        console.log('Test component received notification:', data);
        
        const newNotification = {
          id: Date.now() + Math.random(),
          message: data.message || `Notification: ${data.type}`,
          time: new Date().toLocaleString(),
          type: data.type || 'unknown'
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
      };
      
      notificationService.onAllNotifications(handleNotification);
      
      return () => {
        notificationService.listeners.clear();
      };
    }
  }, [user]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const triggerTestNotification = () => {
    // This would normally be triggered by backend events
    // For testing purposes, we'll simulate a notification
    const testNotification = {
      type: 'testNotification',
      message: 'This is a test notification',
      timestamp: new Date().toISOString()
    };
    
    // Emit the notification locally for testing
    notificationService.emit('testNotification', testNotification);
    showSnackbar('Test notification triggered', 'info');
  };

  const clearNotifications = () => {
    setNotifications([]);
    notificationService.clearNotificationHistory();
    showSnackbar('Notifications cleared', 'success');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Notification Test
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Controls
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            onClick={triggerTestNotification}
            disabled={!user}
          >
            Trigger Test Notification
          </Button>
          <Button 
            variant="outlined" 
            onClick={clearNotifications}
          >
            Clear Notifications
          </Button>
        </Box>
      </Paper>
      
      <Paper>
        <Typography variant="h6" sx={{ p: 2 }}>
          Received Notifications
        </Typography>
        <Divider />
        <List>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No notifications received" 
                secondary="Trigger a test notification or perform actions that generate notifications"
              />
            </ListItem>
          ) : (
            notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={notification.message}
                    secondary={
                      <React.Fragment>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {notification.type}
                        </Typography>
                        {" — " + notification.time}
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NotificationTest;