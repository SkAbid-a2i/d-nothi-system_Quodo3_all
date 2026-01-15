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

  const getCurrentUser = async (retryCount = 0) => {
    frontendLogger.info('Getting current user', { retryCount });
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data?.data || response.data;
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        frontendLogger.setUserId(userData.id);
        frontendLogger.info('User authenticated successfully', { userId: userData.id, role: userData.role });
        
        // Initialize notification service (non-blocking)
        notificationService.connect(userData.id).catch(error => {
          console.error('Failed to connect to notification service:', error);
        });
        
        // Log audit entry
        auditLog.userLogin(userData.id, userData.username);
      } else {
        throw new Error('Invalid user data received');
      }
    } catch (error) {
      frontendLogger.error('Failed to get current user', { 
        error: error.message,
        status: error.response?.status,
        retryCount
      });
      
      let shouldSetLoadingFalse = true;
      
      // Handle different types of errors appropriately
      if (error.response?.status === 401) {
        // Definite token invalidation - remove authentication
        frontendLogger.warn('Token invalid (401), removing authentication');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        // Network errors or timeout - retry with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          frontendLogger.info(`Network error, retrying in ${delay}ms`, { retryCount: retryCount + 1 });
          setTimeout(() => {
            getCurrentUser(retryCount + 1);
          }, delay);
          shouldSetLoadingFalse = false; // Don't set loading to false yet
        } else {
          // Max retries reached for network errors
          frontendLogger.warn('Max network retries reached, keeping token but setting unauthenticated state');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else if (error.response?.status >= 500) {
        // Server errors - retry with backoff
        if (retryCount < 2) {
          const delay = (retryCount + 1) * 2000; // 2s, 4s
          frontendLogger.info(`Server error (${error.response.status}), retrying in ${delay}ms`, { retryCount: retryCount + 1 });
          setTimeout(() => {
            getCurrentUser(retryCount + 1);
          }, delay);
          shouldSetLoadingFalse = false; // Don't set loading to false yet
        } else {
          // Max retries reached for server errors
          frontendLogger.warn('Max server retries reached, keeping token but setting unauthenticated state');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // Other errors (400, 403, 404, etc.) - don't retry, but keep token
        frontendLogger.warn('Other error occurred, keeping token but setting unauthenticated state', { 
          status: error.response?.status,
          message: error.message 
        });
        setIsAuthenticated(false);
        setUser(null);
      }
      
      // Set loading state
      if (shouldSetLoadingFalse) {
        setLoading(false);
      }
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
      
      // Initialize notification service (non-blocking)
      notificationService.connect(userData.id).catch(error => {
        console.error('Failed to connect to notification service:', error);
      });
      
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

  const updateUser = (userData) => {
    setUser(userData);
    // Also update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const updatedUser = { ...parsedUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    getCurrentUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;