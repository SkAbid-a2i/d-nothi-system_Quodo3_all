import React from 'react';
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
  FormControlLabel
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
  Storage as DatabaseIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Layout = ({ darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

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

  // Add database and log monitoring for SystemAdmin
  if (user && user.role === 'SystemAdmin') {
    menuItems.splice(4, 0, { text: 'Database', icon: <DatabaseIcon />, path: '/database' });
    menuItems.push({ text: 'Log Monitoring', icon: <LogIcon />, path: '/logs' });
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            D-Nothi Task Management System
          </Typography>
          <FormControlLabel
            control={<Switch checked={darkMode} onChange={toggleDarkMode} />}
            label={darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          />
          <Typography variant="body2" sx={{ mr: 2, ml: 1 }}>
            {t('common.welcome')}, {user?.fullName || user?.username || 'User'}
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            {t('navigation.logout')}
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => {
              // Check if the menu item should be visible based on user role
              if (item.allowedRoles && !item.allowedRoles.includes(user?.role)) {
                return null;
              }
              
              return (
                <ListItem 
                  button 
                  key={item.text}
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigation(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
          <Divider />
          <List>
            <ListItem 
              button
              selected={location.pathname === '/settings'}
              onClick={() => handleNavigation('/settings')}
            >
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.settings')} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;