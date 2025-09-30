import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskManagement from './components/TaskManagement';
import LeaveManagement from './components/LeaveManagement';
import UserManagement from './components/UserManagement';
import ReportManagement from './components/ReportManagement';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#967bb6', // Lavender
    },
    secondary: {
      main: '#98fb98', // Pale Green
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route element={<Layout />}>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <TaskManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/leaves" 
                element={
                  <ProtectedRoute>
                    <LeaveManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute allowedRoles={['SystemAdmin', 'Admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Supervisor']}>
                    <ReportManagement />
                  </ProtectedRoute>
                } 
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;