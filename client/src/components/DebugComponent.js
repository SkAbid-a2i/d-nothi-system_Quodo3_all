import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const DebugComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('DebugComponent rendered with:', { user, isAuthenticated, loading });
  
  if (loading) {
    return <div>Debug: Loading authentication state...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Debug: User not authenticated</div>;
  }
  
  return (
    <div>
      <h2>Debug Information</h2>
      <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
      <p>User: {user ? JSON.stringify(user) : 'None'}</p>
      <p>Role: {user?.role || 'None'}</p>
    </div>
  );
};

export default DebugComponent;