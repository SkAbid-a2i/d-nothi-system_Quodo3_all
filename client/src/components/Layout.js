import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
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
  Fade
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
  BugReport as LogIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Language as LanguageIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

const drawerWidth = 260;

// Styled components for modern look
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: theme.palette.mode === 'dark' 
      ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRight: 'none',
    color: 'white',
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 0 20px rgba(0, 0, 0, 0.5)' 
      : '0 0 20px rgba(0, 0, 0, 0.1)'
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
    : '1px solid rgba(0, 0, 0, 0.1)'
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

  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('navigation.taskLogger'), icon: <TaskIcon />, path: '/tasks' },
    { text: t('navigation.myTasks'), icon: <TaskIcon />, path: '/my-tasks' },
    { text: t('navigation.leaves'), icon: <LeaveIcon />, path: '/leaves' },
    { text: t('navigation.files'), icon: <TaskIcon />, path: '/files' },
    { text: t('navigation.adminConsole'), icon: <UserIcon />, path: '/admin', allowedRoles: ['SystemAdmin'] },
    { text: t('navigation.reports'), icon: <ReportIcon />, path: '/reports', allowedRoles: ['SystemAdmin', 'Admin', 'Supervisor'] },
    { text: t('navigation.help'), icon: <HelpIcon />, path: '/help' },
  ];

  // Add team tasks for Admin/Supervisor
  if (user && (user.role === 'Admin' || user.role === 'Supervisor')) {
    menuItems.splice(3, 0, { text: t('navigation.teamTasks'), icon: <TaskIcon />, path: '/team-tasks' });
  }

  // Add log monitoring for SystemAdmin
  if (user && user.role === 'SystemAdmin') {
    menuItems.push({ text: 'Log Monitoring', icon: <LogIcon />, path: '/logs' });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationAnchor(null);
  };

  const menuId = 'primary-search-account-menu';
  const notificationId = 'primary-notification-menu';

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <StyledAppBar position="fixed">
        <Toolbar>
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
              <Badge badgeContent={3} color="error">
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
      
      <StyledDrawer variant="permanent">
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.1)'
          }}>
            <Avatar sx={{ 
              width: 48, 
              height: 48,
              bgcolor: 'secondary.main',
              color: 'white',
              mr: 2
            }}>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                {user?.fullName || user?.username || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {user?.role || 'User'}
              </Typography>
            </Box>
          </Box>
          
          <List>
            {menuItems.map((item) => {
              // Check if the menu item should be visible based on user role
              if (item.allowedRoles && !item.allowedRoles.includes(user?.role)) {
                return null;
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
                  <ListItemText primary={item.text} />
                </StyledListItem>
              );
            })}
          </List>
          <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
          <StyledListItem 
            button
            selected={location.pathname === '/settings'}
            onClick={() => handleNavigation('/settings')}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t('navigation.settings')} />
          </StyledListItem>
        </Box>
      </StyledDrawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Fade in={true} timeout={500}>
          <Box sx={{ 
            minHeight: 'calc(100vh - 64px - 24px)',
            background: darkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
              : 'linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%)',
            borderRadius: 3,
            p: 3,
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
        <MenuItem onClick={handleMenuClose}>
          <AccountCircle sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
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
      >
        <MenuItem>
          <Typography variant="subtitle2">New task assigned</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="subtitle2">Leave approved</Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="subtitle2">System update available</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;