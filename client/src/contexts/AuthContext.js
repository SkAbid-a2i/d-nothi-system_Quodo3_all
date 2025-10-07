import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { auditLog } from '../services/auditLogger';
import frontendLogger from '../services/frontendLogger';
import notificationService from '../services/notificationService';
import { Box, CircularProgress } from '@mui/material';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on initial load
  useEffect(() => {
    frontendLogger.info('Auth provider initialized');
    const token = localStorage.getItem('token');
    if (token) {
      // Validate token and get user data
      getCurrentUser();
    } else {
      frontendLogger.info('No token found, setting unauthenticated state');
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    frontendLogger.info('Getting current user');
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data?.data || response.data;
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        frontendLogger.setUserId(userData.id);
        frontendLogger.info('User authenticated successfully', { userId: userData.id, role: userData.role });
        
        // Initialize notification service
        notificationService.connect(userData.id);
        
        // Log audit entry
        auditLog.userLogin(userData.id, userData.username);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      frontendLogger.error('Failed to get current user', { 
        error: error.message,
        status: error.response?.status
      });
      
      // Token is invalid, remove it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    frontendLogger.logAuthEvent('login_attempt', { username: credentials.username });
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      frontendLogger.setUserId(userData.id);
      
      // Initialize notification service
      notificationService.connect(userData.id);
      
      // Log audit entry
      auditLog.userLogin(userData.id, userData.username);
      
      frontendLogger.logAuthEvent('login_success', { userId: userData.id, role: userData.role });
      return { success: true };
    } catch (error) {
      frontendLogger.logAuthEvent('login_failed', { 
        username: credentials.username,
        error: error.message,
        status: error.response?.status
      });
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    frontendLogger.logAuthEvent('logout', { userId: user?.id });
    
    // Disconnect notification service
    notificationService.disconnect();
    
    // Remove token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setUser(null);
    setIsAuthenticated(false);
    
    // Log audit entry
    if (user) {
      auditLog.userLogout(user.id, user.username);
    }
    
    frontendLogger.info('User logged out');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    getCurrentUser
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;