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
import AdminConsole from './components/AdminConsole';
import ReportManagement from './components/ReportManagement';
import Settings from './components/Settings';
import Help from './components/Help';
import Files from './components/Files';
import LogMonitoring from './components/LogMonitoring';
import DebugComponent from './components/DebugComponent';
import TestComponent from './components/TestComponent';
import ApiTest from './components/ApiTest';
import TaskDebug from './components/TaskDebug';
import MeetingEngagement from './components/MeetingEngagement';
import ErrorMonitoring from './components/ErrorMonitoring';

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
      text: {
        primary: darkMode ? '#f1f5f9' : '#1e293b',
        secondary: darkMode ? '#cbd5e1' : '#64748b',
        disabled: darkMode ? '#94a3b8' : '#94a3b8'
      },
      success: {
        main: '#10b981', // Modern green
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff'
      },
      warning: {
        main: '#f59e0b', // Modern amber
        light: '#fbbf24',
        dark: '#d97706',
        contrastText: '#ffffff'
      },
      error: {
        main: '#ef4444', // Modern red
        light: '#f87171',
        dark: '#dc2626',
        contrastText: '#ffffff'
      },
      info: {
        main: '#3b82f6', // Modern blue
        light: '#60a5fa',
        dark: '#2563eb',
        contrastText: '#ffffff'
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
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
              borderRadius: 8,
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#667eea' : '#667eea',
              }
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: darkMode ? '#667eea' : '#667eea',
            },
            '& .MuiInputBase-input': {
              color: darkMode ? '#f1f5f9' : '#1e293b',
            }
          }
        }
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: darkMode ? '#667eea' : '#667eea',
            },
            '& .MuiSelect-select': {
              color: darkMode ? '#f1f5f9' : '#1e293b',
            }
          }
        }
      },
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
      darkMode 
        ? '0 4px 8px rgba(0, 0, 0, 0.2)' 
        : '0 4px 8px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 6px 12px rgba(0, 0, 0, 0.2)' 
        : '0 6px 12px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 8px 16px rgba(0, 0, 0, 0.2)' 
        : '0 8px 16px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 10px 20px rgba(0, 0, 0, 0.2)' 
        : '0 10px 20px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 12px 24px rgba(0, 0, 0, 0.2)' 
        : '0 12px 24px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 14px 28px rgba(0, 0, 0, 0.2)' 
        : '0 14px 28px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 16px 32px rgba(0, 0, 0, 0.2)' 
        : '0 16px 32px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 18px 36px rgba(0, 0, 0, 0.2)' 
        : '0 18px 36px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 20px 40px rgba(0, 0, 0, 0.2)' 
        : '0 20px 40px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 22px 44px rgba(0, 0, 0, 0.2)' 
        : '0 22px 44px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 24px 48px rgba(0, 0, 0, 0.2)' 
        : '0 24px 48px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 26px 52px rgba(0, 0, 0, 0.2)' 
        : '0 26px 52px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 28px 56px rgba(0, 0, 0, 0.2)' 
        : '0 28px 56px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 30px 60px rgba(0, 0, 0, 0.2)' 
        : '0 30px 60px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 32px 64px rgba(0, 0, 0, 0.2)' 
        : '0 32px 64px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 34px 68px rgba(0, 0, 0, 0.2)' 
        : '0 34px 68px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 36px 72px rgba(0, 0, 0, 0.2)' 
        : '0 36px 72px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 38px 76px rgba(0, 0, 0, 0.2)' 
        : '0 38px 76px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 40px 80px rgba(0, 0, 0, 0.2)' 
        : '0 40px 80px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 42px 84px rgba(0, 0, 0, 0.2)' 
        : '0 42px 84px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 44px 88px rgba(0, 0, 0, 0.2)' 
        : '0 44px 88px rgba(0, 0, 0, 0.1)',
      darkMode 
        ? '0 46px 92px rgba(0, 0, 0, 0.2)' 
        : '0 46px 92px rgba(0, 0, 0, 0.1)'
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
              <Route path="/task-debug" element={<TaskDebug />} />
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
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['SystemAdmin']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<AdminConsole />} />
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
              <Route path="/error-monitoring" element={
                <ProtectedRoute allowedRoles={['SystemAdmin', 'Admin', 'Supervisor']}>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<ErrorMonitoring />} />
              </Route>
              <Route path="/meetings" element={
                <ProtectedRoute>
                  <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </ProtectedRoute>
              }>
                <Route index element={<MeetingEngagement />} />
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

export default App;