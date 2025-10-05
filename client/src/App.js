import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { TranslationProvider } from './contexts/TranslationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskLogger from './components/TaskLogger';
import AgentDashboard from './components/AgentDashboard';
import AdminDashboard from './components/AdminDashboard';
import LeaveManagement from './components/LeaveManagement';
import UserManagement from './components/UserManagement';
import ReportManagement from './components/ReportManagement';
import Settings from './components/Settings';
import Help from './components/Help';
import Files from './components/Files';
import LogMonitoring from './components/LogMonitoring';
import DatabaseViewer from './components/DatabaseViewer';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Create theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#967bb6', // Lavender
      },
      secondary: {
        main: '#98fb98', // Pale Green
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TranslationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <TaskLogger />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/my-tasks" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <AgentDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/team-tasks" element={
                <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/leaves" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <LeaveManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/files" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Files />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <UserManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/database" element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <DatabaseViewer />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Supervisor']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <ReportManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <Help />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/logs" element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                    <LogMonitoring />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </TranslationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;