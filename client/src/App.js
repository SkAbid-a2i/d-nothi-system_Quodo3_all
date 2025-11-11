import React, { useState } from 'react';
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
import PermissionTemplateManagement from './components/PermissionTemplateManagement';
import DropdownManagement from './components/DropdownManagement';
import AdminConsole from './components/AdminConsole';
import ReportManagement from './components/ReportManagement';
import Settings from './components/Settings';
import Help from './components/Help';
import Files from './components/Files';
import LogMonitoring from './components/LogMonitoring';
import MeetingEngagement from './components/MeetingEngagement';
import ErrorMonitoring from './components/ErrorMonitoring';
import CollaborationLink from './components/CollaborationLink';
import KanbanBoard from './components/KanbanBoard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e57373',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? createTheme({ palette: { mode: 'dark' } }) : theme}>
      <CssBaseline />
      <AuthProvider>
        <TranslationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="task-logger" element={<TaskLogger />} />
                <Route path="agent-dashboard" element={<AgentDashboard />} />
                <Route path="admin-dashboard" element={<AdminDashboard />} />
                <Route path="leave-management" element={<LeaveManagement />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="permission-template-management" element={<PermissionTemplateManagement />} />
                <Route path="dropdown-management" element={<DropdownManagement />} />
                <Route path="admin-console" element={<AdminConsole />} />
                <Route path="report-management" element={<ReportManagement />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
                <Route path="files" element={<Files />} />
                <Route path="log-monitoring" element={<LogMonitoring />} />
                <Route path="meeting-engagement" element={<MeetingEngagement />} />
                <Route path="error-monitoring" element={<ErrorMonitoring />} />
                <Route path="collaboration-link" element={<CollaborationLink />} />
                <Route path="kanban" element={<KanbanBoard />} />
              </Route>
            </Routes>
          </Router>
        </TranslationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;