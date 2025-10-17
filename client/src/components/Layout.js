import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  Switch,
  FormControlLabel,
  Badge,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Fade,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  EventAvailable as LeaveIcon,
  People as UserIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Language as LanguageIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  VideoCall as VideoCallIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import CollaborationIcon from './CollaborationIcon';
import { styled, alpha } from '@mui/material/styles';
import notificationService from '../services/notificationService';
import { auditAPI } from '../services/api';

const drawerWidth = 260;
const collapsedDrawerWidth = 70;

// Styled components for modern look
const StyledDrawer = styled(Drawer)(({ theme, open }) => ({
  width: open ? drawerWidth : collapsedDrawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: open ? drawerWidth : collapsedDrawerWidth,
    boxSizing: 'border-box',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRight: 'none',
    color: 'white',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 0 20px rgba(0, 0, 0, 0.5)' 
      : '0 0 20px rgba(0, 0, 0, 0.1)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    // Remove scrollbar
    overflow: 'hidden'
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 46, 0.9)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 2px 20px rgba(0, 0, 0, 0.3)' 
    : '0 2px 20px rgba(0, 0, 0, 0.1)',
  borderBottom: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(0, 0, 0, 0.1)',
  zIndex: theme.zIndex.drawer + 1,
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: '8px',
  margin: '4px 8px',
  transition: 'all 0.3s ease',
  backgroundColor: selected 
    ? alpha(theme.palette.common.white, 0.2) 
    : 'transparent',
  '&:hover': {
    backgroundColor: selected 
      ? alpha(theme.palette.common.white, 0.3) 
      : alpha(theme.palette.common.white, 0.1),
    transform: 'translateX(5px)',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 10px rgba(0, 0, 0, 0.3)' 
      : '0 4px 10px rgba(0, 0, 0, 0.1)'
  },
  '& .MuiListItemIcon-root': {
    color: 'white',
    minWidth: '40px'
  },
  '& .MuiListItemText-primary': {
    color: 'white',
    fontWeight: selected ? 600 : 400
  }
}));

const Layout = ({ darkMode, toggleDarkMode, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, toggleLanguage } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('navigation.taskLogger'), icon: <TaskIcon />, path: '/tasks' },
    { text: t('navigation.myTasks'), icon: <TaskIcon />, path: '/my-tasks' },
    { text: t('navigation.leaves'), icon: <LeaveIcon />, path: '/leaves' },
    { text: t('navigation.meetings'), icon: <VideoCallIcon />, path: '/meetings' },
    { text: t('navigation.collaboration'), icon: <CollaborationIcon />, path: '/collaboration' },
    { text: t('navigation.errorMonitoring'), icon: <ErrorIcon />, path: '/error-monitoring', allowedRoles: ['SystemAdmin', 'Admin', 'Supervisor'] },
    { text: t('navigation.adminConsole'), icon: <UserIcon />, path: '/admin', allowedRoles: ['SystemAdmin'] },
    { text: t('navigation.reports'), icon: <ReportIcon />, path: '/reports', allowedRoles: ['SystemAdmin', 'Admin', 'Supervisor'] },
    { text: t('navigation.help'), icon: <HelpIcon />, path: '/help' },
  ];

  // Add team tasks for Admin/Supervisor
  if (user && (user.role === 'Admin' || user.role === 'Supervisor')) {
    menuItems.splice(3, 0, { text: t('navigation.teamTasks'), icon: <TaskIcon />, path: '/team-tasks' });
  }

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };

  const handleLogout = () => {
    try {
      console.log('Logout initiated');
      logout();
      console.log('Logout completed, redirecting to login');
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, still try to navigate to login
      navigate('/');
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
    // Don't fetch notifications automatically to preserve real-time notifications
    // Only update the unread count to 0 when user opens the notification panel
    if (unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  // Clear notifications for individual user
  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    // Also clear notification history in service
    notificationService.clearNotificationHistory();
    showSnackbar('Notifications cleared', 'success');
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  // Show snackbar helper function
  const showSnackbar = (message, severity = 'success') => {
    // In a real implementation, you might want to use a global snackbar context
    console.log(`${severity}: ${message}`);
  };

  // Fetch real notifications
  const fetchNotifications = async () => {
    // This function is deprecated and should not be used
    // Real-time notifications are handled through the notification service
    console.warn('fetchNotifications is deprecated. Use real-time notifications instead.');
  };

  // Handle screen size changes

  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse drawer on small screens
      if (window.innerWidth < 960) {
        setDrawerOpen(false);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    // Only connect if we have a user
    if (!user || !user.id) return;
    
    // Connect to notification service
    notificationService.connect(user.id);
    // Handle all notifications through a unified handler
    const handleAllNotifications = (data) => {
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
          message = data.message || `New notification: ${notificationType}`;
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
      
      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep only last 20
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to all notifications through the unified handler
    notificationService.onAllNotifications(handleAllNotifications);
          
    // Ensure connection to notification service
    if (user && user.id) {
      notificationService.connect(user.id);
    }

    // Cleanup on unmount
    return () => {
      // Remove all listeners
      notificationService.listeners.clear();
    };
  }, [user]);

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
            D-Nothi Task Management
          </Typography>
          
          <Tooltip title="Notifications">
            <IconButton
              size="large"
              aria-label="show notifications"
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={notifications.length} color="error">
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
        }),
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
            {children || <Outlet />}
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
};

export default Layout;