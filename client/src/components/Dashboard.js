import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import EnhancedDashboard from './EnhancedDashboard';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Use the enhanced dashboard for all users
  return <EnhancedDashboard />;
  
  // Original role-based logic (commented out for now)
  /*
  if (user?.role === 'Agent') {
    return <AgentDashboard />;
  } else if (user?.role === 'Admin' || user?.role === 'Supervisor') {
    return <AdminDashboard />;
  } else {
    // Default dashboard for SystemAdmin or other roles
    return <AdminDashboard />;
  }
  */
};

export default Dashboard;