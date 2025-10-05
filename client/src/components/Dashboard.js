import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ModernDashboard from './ModernDashboard';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // For now, we'll use the modern dashboard for all users
  // You can customize this based on user roles if needed
  return <ModernDashboard />;
  
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