import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AgentDashboard from './AgentDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Render different dashboards based on user role
  if (user?.role === 'Agent') {
    return <AgentDashboard />;
  } else if (user?.role === 'Admin' || user?.role === 'Supervisor') {
    return <AdminDashboard />;
  } else {
    // Default dashboard for SystemAdmin or other roles
    return <AdminDashboard />;
  }
};

export default Dashboard;