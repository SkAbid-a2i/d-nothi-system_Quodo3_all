import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TestDashboard from './TestDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  // Use the test dashboard for now
  return <TestDashboard />;
};

export default Dashboard;