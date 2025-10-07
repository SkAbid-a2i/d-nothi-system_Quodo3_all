import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedDashboard from './EnhancedDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Use the enhanced dashboard for all users
  return <EnhancedDashboard />;
};

export default Dashboard;