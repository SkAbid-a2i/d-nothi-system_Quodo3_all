import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestComponent = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Test Component: Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Test Component: Not authenticated</div>;
  }
  
  return (
    <div>
      <h2>Test Component</h2>
      <p>This is a test to verify routing is working correctly.</p>
      <p>User: {user?.username || 'Unknown'}</p>
      <p>Role: {user?.role || 'Unknown'}</p>
    </div>
  );
};

export default TestComponent;