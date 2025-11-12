// Add comment to trigger new build
// ESLint fix for useEffect dependency
import React, { useState, useEffect } from 'react';

const Chat = ({ user }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
<<<<<<< HEAD
    const handleResize = () => {
      // Auto-collapse drawer on small screens
      if (window.innerWidth < 960) {
        setDrawerOpen(false);
      }
    };
    
    handleResize(); // Initial check
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.removeEventListener) {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    console.log('Layout: Setting up notification listeners, user:', user);
    
    // Only connect if we have a user
    if (!user || !user.id) {
      console.log('Layout: No user or user ID, skipping notification setup');
      return;
    }
    
    console.log('Layout: User role:', user.role);
    console.log('Layout: User info:', {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    });
    
    // Handle all notifications through a unified handler
    const handleAllNotifications = (data) => {
      console.log('Layout: Received notification data:', data);
      console.log('Layout: Current user role:', user.role);
      
      // Handle connection messages separately
      if (data.type === 'connected') {
        console.log('Layout: Connected to notification service:', data.message);
        // Don't show connection messages as notifications
        return;
      }
      
      // Handle disconnection messages
      if (data.type === 'disconnected') {
        console.log('Layout: Disconnected from notification service:', data.reason);
        // Don't show disconnection messages as notifications
        return;
      }
      
      // Handle error messages
      if (data.type === 'error') {
        console.error('Layout: Notification service error:', data.error);
        // Show error messages as notifications for debugging
        const newNotification = {
          id: Date.now() + Math.random(),
          message: `Notification service error: ${data.message || 'Connection failed'}`,
          time: new Date().toLocaleString(),
          type: 'errorNotification',
          displayType: 'error',
          read: false,
          data: data
        };
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only last 20
        setUnreadCount(prev => prev + 1);
        return;
      }
      
      const notificationType = data.type;
      let message = '';
      let displayType = 'info';
      
      // Generate appropriate message based on notification type
      switch(notificationType) {
        case 'taskCreated':
          message = `New task created: ${data.task?.description || 'No description'}`;
          displayType = 'info';
          break;
        case 'taskUpdated':
          message = `Task updated: ${data.task?.description || 'No description'}`;
          displayType = 'info';
          break;
        case 'taskDeleted':
          message = `Task deleted: ${data.task?.description || 'No description'}`;
          displayType = 'warning';
          break;
        case 'leaveRequested':
          message = `New leave request from ${data.leave?.userName || data.leave?.userId || 'Unknown user'}`;
          displayType = 'info';
          break;
        case 'leaveApproved':
          message = `Leave request approved for ${data.leave?.userName || data.leave?.userId || 'Unknown user'}`;
          displayType = 'success';
          break;
        case 'leaveRejected':
          message = `Leave request rejected for ${data.leave?.userName || data.leave?.userId || 'Unknown user'}`;
          displayType = 'warning';
          break;
        case 'userCreated':
          message = `New user created: ${data.user?.username || data.user?.fullName || 'Unknown user'}`;
          displayType = 'info';
          break;
        case 'userUpdated':
          message = `User updated: ${data.user?.username || data.user?.fullName || 'Unknown user'}`;
          displayType = 'info';
          break;
        case 'userDeleted':
          message = `User deleted: ${data.username || data.userId || 'Unknown user'}`;
          displayType = 'warning';
          break;
        case 'dropdownCreated':
          message = `New dropdown value created: ${data.dropdown?.value || 'Unknown value'}`;
          displayType = 'info';
          break;
        case 'dropdownUpdated':
          message = `Dropdown value updated: ${data.dropdown?.value || 'Unknown value'}`;
          displayType = 'info';
          break;
        case 'dropdownDeleted':
          message = `Dropdown value deleted: ${data.dropdownValue || 'Unknown value'}`;
          displayType = 'warning';
          break;
        case 'permissionTemplateCreated':
          message = `New permission template created: ${data.template?.name || 'Unknown template'}`;
          displayType = 'info';
          break;
        case 'permissionTemplateUpdated':
          message = `Permission template updated: ${data.template?.name || 'Unknown template'}`;
          displayType = 'info';
          break;
        case 'permissionTemplateDeleted':
          message = `Permission template deleted: ${data.templateName || 'Unknown template'}`;
          displayType = 'warning';
          break;
        case 'meetingCreated':
          message = `New meeting scheduled: ${data.meeting?.subject || 'No subject'}`;
          displayType = 'info';
          break;
        case 'meetingUpdated':
          message = `Meeting updated: ${data.meeting?.subject || 'No subject'}`;
          displayType = 'info';
          break;
        case 'meetingDeleted':
          message = `Meeting cancelled: ${data.meeting?.subject || 'No subject'}`;
          displayType = 'warning';
          break;
        case 'collaborationCreated':
          message = `New collaboration link created: ${data.collaboration?.title || 'No title'}`;
          displayType = 'info';
          break;
        case 'collaborationUpdated':
          message = `Collaboration link updated: ${data.collaboration?.title || 'No title'}`;
          displayType = 'info';
          break;
        case 'collaborationDeleted':
          message = `Collaboration link deleted: ${data.collaboration?.title || 'No title'}`;
          displayType = 'warning';
          break;
        case 'errorNotification':
          message = `Error: ${data.message || 'System error occurred'}`;
          displayType = 'error';
          break;
        case 'warningNotification':
          message = `Warning: ${data.message || 'System warning'}`;
          displayType = 'warning';
          break;
        default:
          // Handle undefined or unknown notification types
          if (!data.type) {
            console.warn('Layout: Received notification with undefined type:', data);
            // Still show notifications without a type to avoid missing important messages
            message = data.message || 'New notification';
          } else {
            message = data.message || `New notification: ${notificationType}`;
          }
          displayType = 'info';
      }
      
      const newNotification = {
        id: Date.now() + Math.random(),
        message: message,
        time: new Date().toLocaleString(),
        type: notificationType,
        displayType: displayType,
        read: false,
        data: data // Store original data for potential future use
      };
      
      console.log('Layout: Adding new notification to state:', newNotification);
      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only last 20
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to all notifications through the unified handler
    console.log('Layout: Subscribing to notification service');
    notificationService.onAllNotifications(handleAllNotifications);
          
    // Ensure connection to notification service (non-blocking)
    console.log('Layout: Connecting to notification service with user ID:', user.id);
    notificationService.connect(user.id).catch(error => {
      console.error('Layout: Failed to connect to notification service:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('Layout: Cleaning up notification listeners');
      // Remove the specific listener
      notificationService.off('notification', handleAllNotifications);
      // Don't disconnect from notification service on component unmount
      // Keep connection alive for better user experience
    };
  }, [user]); // Only reconnect when user changes

  // Filter notifications based on current page
  const getFilteredNotifications = () => {
    // Show all notifications in the unified notification system
    return notifications;
  };

  // Group notifications by type for better organization
  const groupNotificationsByType = () => {
    const grouped = {
      meetings: [],
      leaves: [],
      tasks: [],
      users: [],
      dropdowns: [],
      permissions: [],
      collaborations: [],
      errors: [],
      warnings: [],
      system: [],
      other: []
    };

    notifications.forEach(notification => {
      // Safety check to ensure notification.type exists
      if (!notification.type) {
        grouped.other.push(notification);
        return;
      }
      
      if (notification.type.includes('meeting')) {
        grouped.meetings.push(notification);
      } else if (notification.type.includes('leave')) {
        grouped.leaves.push(notification);
      } else if (notification.type.includes('task')) {
        grouped.tasks.push(notification);
      } else if (notification.type.includes('user')) {
        grouped.users.push(notification);
      } else if (notification.type.includes('dropdown')) {
        grouped.dropdowns.push(notification);
      } else if (notification.type.includes('permission')) {
        grouped.permissions.push(notification);
      } else if (notification.type.includes('collaboration')) {
        grouped.collaborations.push(notification);
      } else if (notification.type.includes('error')) {
        grouped.errors.push(notification);
      } else if (notification.type.includes('warning')) {
        grouped.warnings.push(notification);
      } else if (notification.type.includes('system')) {
        grouped.system.push(notification);
      } else {
        grouped.other.push(notification);
      }
    });

    return grouped;
  };

  // Get notification type label
  const getNotificationTypeLabel = (type) => {
    // Safety check
    if (!type) return 'Other';
    
    if (type.includes('meeting')) return 'Meeting';
    if (type.includes('leave')) return 'Leave';
    if (type.includes('task')) return 'Task';
    if (type.includes('user')) return 'User';
    if (type.includes('dropdown')) return 'Dropdown';
    if (type.includes('permission')) return 'Permission';
    if (type.includes('collaboration')) return 'Collaboration';
    if (type.includes('error')) return 'Error';
    if (type.includes('warning')) return 'Warning';
    if (type.includes('system')) return 'System';
    return 'Other';
  };

  // Get notification type color
  const getNotificationTypeColor = (type) => {
    // Safety check
    if (!type) return '#8ac926';
    
    if (type.includes('meeting')) return '#667eea';
    if (type.includes('leave')) return '#967bb6';
    if (type.includes('task')) return '#764ba2';
    if (type.includes('user')) return '#f4a261';
    if (type.includes('dropdown')) return '#2a9d8f';
    if (type.includes('permission')) return '#e76f51';
    if (type.includes('collaboration')) return '#4361ee';
    if (type.includes('error')) return '#e63946';
    if (type.includes('warning')) return '#f59e0b';
    if (type.includes('system')) return '#8b5cf6';
    return '#8ac926';
  };

  const menuId = 'primary-search-account-menu';
  const notificationId = 'primary-notification-menu';

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      <CssBaseline />
      <StyledAppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2,
              color: darkMode ? '#98fb98' : '#667eea'
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              background: darkMode 
                ? 'linear-gradient(45deg, #967bb6, #98fb98)' 
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700
            }}
          >
            D-Nothi Team & Activity Management
          </Typography>
          
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: darkMode ? 'white' : 'black' }} />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Language">
            <IconButton
              size="large"
              aria-label="change language"
              color="inherit"
              onClick={toggleLanguage}
              sx={{ mx: 1 }}
            >
              <LanguageIcon sx={{ color: darkMode ? 'white' : 'black' }} />
            </IconButton>
          </Tooltip>
          
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode} 
                onChange={toggleDarkMode} 
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#98fb98',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#98fb98',
                  },
                }}
              />
            }
            label={darkMode ? <DarkModeIcon sx={{ color: '#98fb98' }} /> : <LightModeIcon sx={{ color: '#f4a261' }} />}
          />
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 2 }}>
            <Tooltip title="Account">
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}
                >
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>
      
      <StyledDrawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'hidden', p: 2, height: 'calc(100% - 64px)', overflowY: 'auto' }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.1)',
            justifyContent: 'center',
            // Ensure full collapse when drawer is closed
            width: drawerOpen ? 'auto' : 40,
            height: drawerOpen ? 'auto' : 40,
            overflow: 'hidden'
          }}>
            <Avatar sx={{ 
              width: drawerOpen ? 48 : 32, 
              height: drawerOpen ? 48 : 32,
              bgcolor: 'secondary.main',
              color: 'white',
              mr: drawerOpen ? 2 : 0,
              fontSize: drawerOpen ? 'default' : '0.7rem',
              // Ensure avatar doesn't prevent collapse
              minWidth: drawerOpen ? 48 : 32,
              minHeight: drawerOpen ? 48 : 32
            }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            {drawerOpen && (
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.fullName || user?.username || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.role || 'User'}
                </Typography>
              </Box>
            )}
          </Box>
          
          <List>
            {menuItems.map((item) => {
              // Check if the menu item should be visible based on user role
              if (item.allowedRoles && !item.allowedRoles.includes(user?.role)) {
                return null;
              }
              
              // Special handling for Admin Console
              if (item.path === '/admin' && user && user.role === 'SystemAdmin') {
                return (
                  <Box key={item.text}>
                    <StyledListItem 
                      button
                      selected={location.pathname === '/admin'}
                      onClick={() => handleNavigation('/admin')}
                    >
                      <ListItemIcon>
                        {item.icon}
                      </ListItemIcon>
                      {drawerOpen && <ListItemText primary={item.text} />}
                    </StyledListItem>
                  </Box>
                );
              }
              
              return (
                <StyledListItem 
                  button 
                  key={item.text}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  {drawerOpen && <ListItemText primary={item.text} />}
                </StyledListItem>
              );
            })}
            
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
            <StyledListItem 
              button
              selected={location.pathname === '/settings'}
              onClick={() => handleNavigation('/settings')}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              {drawerOpen && <ListItemText primary={t('navigation.settings')} />}
            </StyledListItem>
          </List>
        </Box>
      </StyledDrawer>
      
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 1, sm: 2, md: 3 },
        width: { xs: '100%', md: `calc(100% - ${drawerOpen ? drawerWidth : collapsedDrawerWidth}px)` },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        })
      }}>
        <Toolbar />
        <Fade in={true} timeout={500}>
          <Box sx={{ 
            minHeight: 'calc(100vh - 64px - 24px)',
            background: darkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
              : 'linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%)',
            borderRadius: { xs: 0, sm: 2, md: 3 },
            p: { xs: 1, sm: 2, md: 3 },
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: darkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            {/* Always render Outlet for nested routes */}
            <Outlet />
          </Box>
        </Fade>
      </Box>
      
      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id={menuId}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          navigate('/settings');
        }}>
          <SettingsIcon sx={{ mr: 1 }} />
          My account
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1 }} />
          {t('navigation.logout')}
        </MenuItem>
      </Menu>
      
      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id={notificationId}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(notificationAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          style: {
            maxHeight: 500,
            width: 350,
          },
        }}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">All Notifications</Typography>
        </MenuItem>
        <Divider />
        {loadingNotifications ? (
          <MenuItem>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading notifications...
          </MenuItem>
        ) : getFilteredNotifications().length === 0 ? (
          <MenuItem>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </MenuItem>
        ) : (
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {Object.entries(groupNotificationsByType()).map(([category, categoryNotifications]) => 
              categoryNotifications.length > 0 && (
                <React.Fragment key={category}>
                  <MenuItem disabled>
                    <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                      {category}
                    </Typography>
                  </MenuItem>
                  {categoryNotifications.map((notification) => (
                    <MenuItem 
                      key={notification.id} 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-start',
                        maxWidth: 300,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                        '&:last-child': {
                          borderBottom: 'none'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
                        <Box 
                          sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            bgcolor: getNotificationTypeColor(notification.type),
                            mr: 1 
                          }} 
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
                          {notification.message}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="caption" color="text.secondary">
                          {getNotificationTypeLabel(notification.type)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </React.Fragment>
              )
            )}
          </Box>
        )}
        {getFilteredNotifications().length > 0 && (
          <MenuItem>
            <Button 
              fullWidth 
              variant="text" 
              onClick={handleClearNotifications}
              sx={{ textTransform: 'none' }}
            >
              Clear All Notifications
            </Button>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
=======
    // Reconnect to the chat service when user changes
  }, [user]); // Only reconnect when user changes
>>>>>>> 5adfb133814a9ac7a0c035ff22f8e4ea011964f4
};

export default Chat;
