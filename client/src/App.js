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
import PermissionTemplateManagement from './components/PermissionTemplateManagement';
import DropdownManagement from './components/DropdownManagement';
import ReportManagement from './components/ReportManagement';
import Settings from './components/Settings';
import Help from './components/Help';
import Files from './components/Files';
import LogMonitoring from './components/LogMonitoring';
import DebugComponent from './components/DebugComponent';
import TestComponent from './components/TestComponent';
import ApiTest from './components/ApiTest';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Create theme based on dark mode state with modern color palette
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#667eea', // Modern blue gradient start
        light: '#764ba2', // Purple for lighter accents
        dark: '#5a67d8', // Darker blue for contrast
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#f093fb', // Modern pink
        light: '#f5b4fb',
        dark: '#ec69f0',
        contrastText: '#ffffff'
      },
      background: {
        default: darkMode ? '#0f172a' : '#f8fafc',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
      success: {
        main: '#10b981', // Modern green
        light: '#34d399',
        dark: '#059669'
      },
      warning: {
        main: '#f59e0b', // Modern amber
        light: '#fbbf24',
        dark: '#d97706'
      },
      error: {
        main: '#ef4444', // Modern red
        light: '#f87171',
        dark: '#dc2626'
      },
      info: {
        main: '#3b82f6', // Modern blue
        light: '#60a5fa',
        dark: '#2563eb'
      }
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif'
      ].join(','),
      h1: {
        fontWeight: 700,
        letterSpacing: '-0.5px'
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '-0.3px'
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '-0.2px'
      },
      h4: {
        fontWeight: 600
      },
      h5: {
        fontWeight: 600
      },
      h6: {
        fontWeight: 600
      },
      button: {
        fontWeight: 600,
        textTransform: 'none'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }
          },
          contained: {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            '&:hover': {
              boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode 
              ? '0 10px 25px rgba(0, 0, 0, 0.3)' 
              : '0 10px 25px rgba(0, 0, 0, 0.05)'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: darkMode 
              ? '0 4px 12px rgba(0, 0, 0, 0.2)' 
              : '0 4px 12px rgba(0, 0, 0, 0.08)'
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8
            }
          }
        }
      }
    },
    shape: {
      borderRadius: 8
    },
    shadows: [
      'none',
      darkMode 
        ? '0 1px 3px rgba(0, 0, 0, 0.2)' 
        : '0 1px 3px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 2px 6px rgba(0, 0, 0, 0.2)' 
        : '0 2px 6px rgba(0, 0, 0, 0.1)',
      // ... rest of shadows array would be defined
    ]
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
              <Route path="/api-test" element={<ApiTest />} />
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
                <Route path="permission-templates" element={<PermissionTemplateManagement />} />
                <Route path="dropdowns" element={<DropdownManagement />} />
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