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
import DebugComponent from './components/DebugComponent';
import TestComponent from './components/TestComponent';

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
              <Route path="/debug" element={<DebugComponent />} />
              <Route path="/test" element={<TestComponent />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
              </Route>
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<TaskLogger />} />
              </Route>
              <Route path="/my-tasks" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<AgentDashboard />} />
              </Route>
              <Route path="/team-tasks" element={
                <ProtectedRoute allowedRoles={['Admin', 'Supervisor']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
              </Route>
              <Route path="/leaves" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<LeaveManagement />} />
              </Route>
              <Route path="/files" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<Files />} />
              </Route>
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<UserManagement />} />
              </Route>
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Supervisor']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<ReportManagement />} />
              </Route>
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
              </Route>
              <Route path="/help" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<Help />} />
              </Route>
              <Route path="/logs" element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<LogMonitoring />} />
              </Route>
              {/* Fallback route for debugging */}
              <Route path="*" element={
                <div>
                  <h1>404 - Page Not Found</h1>
                  <p>This is a fallback route for debugging purposes.</p>
                  <p>If you see this page, the routing is not working correctly.</p>
                </div>
              } />
            </Routes>
          </Router>
        </TranslationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Force redeployment - commit 549dfa3 fix
export default App;