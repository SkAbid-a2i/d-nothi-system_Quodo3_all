import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';

/**
 * Custom hook for fetching and managing user filter dropdown functionality
 * @param {Object} user - Current authenticated user object
 * @returns {Object} - User filter state and functions
 */
const useUserFilter = (user) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all users for admin roles
   */
  const fetchUsers = useCallback(async () => {
    if (!user || !['SystemAdmin', 'Admin', 'Supervisor'].includes(user.role)) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching all users for filter dropdown...');
      const response = await userAPI.getAllUsers();
      
      console.log('Users response:', response);
      
      // Process users to ensure proper format
      const userData = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || response.data?.users || response.data || []);
        
      console.log('Raw users data:', response);
      console.log('Processed users data:', userData);
      console.log('Users data type:', typeof userData);
      console.log('Users data length:', userData.length);
      
      // Process users to ensure proper format
      const processedUsers = userData
        .filter(user => user && user.id && (user.username || user.email)) // Filter out invalid users
        .map(user => ({
          id: user.id,
          label: (user.fullName || user.username || user.email) + ' (' + (user.username || user.email) + ')',
          value: user.username || user.email,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role
        }));
      
      console.log('Final processed users:', processedUsers);
      console.log('Processed users length:', processedUsers.length);
      setUsers(processedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      setError('Failed to load users. Please refresh the page.');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Reset user filter state
   */
  const resetUsers = useCallback(() => {
    setUsers([]);
    setError(null);
  }, []);

  // Fetch users when user role changes
  useEffect(() => {
    if (user && ['SystemAdmin', 'Admin', 'Supervisor'].includes(user.role)) {
      fetchUsers();
    } else {
      resetUsers();
    }
  }, [user?.role, fetchUsers, resetUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    resetUsers
  };
};

export default useUserFilter;