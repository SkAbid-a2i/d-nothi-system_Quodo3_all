import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Visibility as VisibilityIcon,
  Api as ApiIcon
} from '@mui/icons-material';
import { logAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ErrorMonitoring = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  const stats = {
    total: logs.length,
    errors: logs.filter(log => log.level === 'error').length,
    warnings: logs.filter(log => log.level === 'warn').length,
    info: logs.filter(log => log.level === 'info').length,
    success: logs.filter(log => log.level === 'success').length,
    frontend: logs.filter(log => log.metadata?.source === 'frontend').length,
    backend: logs.filter(log => !log.metadata?.source || log.metadata?.source !== 'frontend').length
  };

  // Add error analysis function
  const analyzeErrors = () => {
    const errorAnalysis = {
      missingFields: [],
      uiIssues: [],
      apiErrors: [],
      databaseErrors: [],
      validationErrors: []
    };

    logs.forEach(log => {
      if (log.level === 'error' || log.level === 'warn') {
        const message = log.message?.toLowerCase() || '';
        // Removed unused metadata variable

        // Check for missing field issues
        if (message.includes('field') && (message.includes('missing') || message.includes('not found') || message.includes('undefined'))) {
          errorAnalysis.missingFields.push(log);
        }

        // Check for UI/visibility issues
        if (message.includes('ui') || message.includes('view') || message.includes('display') || message.includes('visible') || message.includes('popup')) {
          errorAnalysis.uiIssues.push(log);
        }

        // Check for API errors
        if (message.includes('api') || message.includes('request') || message.includes('response') || message.includes('fetch') || message.includes('network')) {
          errorAnalysis.apiErrors.push(log);
        }

        // Check for database errors
        if (message.includes('database') || message.includes('db') || message.includes('sequelize') || message.includes('connection')) {
          errorAnalysis.databaseErrors.push(log);
        }

        // Check for validation errors
        if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
          errorAnalysis.validationErrors.push(log);
        }

        // Specific issue tracking
        if (message.includes('flag dropdown') && message.includes('task logger')) {
          errorAnalysis.uiIssues.push({
            ...log,
            issueType: 'Flag Dropdown Missing',
            component: 'TaskLogger',
            description: 'Flag dropdown field not visible in Task Logger page All tasks section'
          });
        }

        if (message.includes('popup') && (message.includes('leave') && (message.includes('approve') || message.includes('reject')))) {
          errorAnalysis.uiIssues.push({
            ...log,
            issueType: 'Popup Not Closing',
            component: 'LeaveManagement',
            description: 'Popup view of approved and rejected leaves not closing without cancel button'
          });
        }
      }
    });

    return errorAnalysis;
  };

  const errorAnalysis = analyzeErrors();

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      // Ensure we have a valid user before making the API call
      if (!user) {
        throw new Error('User not authenticated');
      }

      const params = {};
      
      if (filterLevel !== 'all') {
        params.level = filterLevel;
      }
      
      if (filterSource !== 'all') {
        params.source = filterSource;
      }
      
      if (filterUser) {
        params.user = filterUser;
      }
      
      if (filterDate) {
        params.date = filterDate;
      }

      const response = await logAPI.getLogs(params);
      
      // Handle different response structures
      const logsData = response.data?.data || response.data?.logs || response.data || [];
      
      setLogs(Array.isArray(logsData) ? logsData : []);
    } catch (err) {
      console.error('Error fetching logs:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch logs';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      // Set empty data on error to prevent blank page
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await logAPI.analyzeLogs({ hours: 24 });
      setAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch analysis';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'error';
      case 'warn': return 'warning';
      case 'info': return 'info';
      case 'success': return 'success';
      default: return 'default';
    }
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <ErrorIcon />;
      case 'warn': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      case 'success': return <SuccessIcon />;
      default: return <InfoIcon />;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'frontend': return <VisibilityIcon />;
      case 'backend': return <StorageIcon />;
      default: return <CodeIcon />;
    }
  };

  const clearLogs = async () => {
    try {
      // In a real implementation, you would call an API to clear logs
      setLogs([]);
      showSnackbar('Logs cleared successfully', 'success');
    } catch (err) {
      console.error('Error clearing logs:', err);
      showSnackbar('Failed to clear logs', 'error');
    }
  };

  // Fetch logs when filters change or component mounts
  useEffect(() => {
    if (user) {
      if (activeTab === 0) {
        fetchLogs();
      } else if (activeTab === 1) {
        fetchAnalysis();
      }
    }
  }, [filterLevel, filterSource, filterUser, filterDate, user, activeTab]);

  // Extract page name from URL or metadata
  const getPageName = (log) => {
    // For frontend logs, extract page name from URL
    if (log.metadata?.source === 'frontend' && log.metadata?.url) {
      try {
        const urlObj = new URL(log.metadata.url, window.location.origin);
        // Return a more descriptive name based on the path
        const path = urlObj.pathname;
        if (path === '/') return 'Dashboard';
        if (path.includes('/tasks/logger')) return 'Task Logger Page';
        if (path.includes('/tasks')) return 'Task Modification & Activity Page';
        if (path.includes('/leave')) return 'Leave Management';
        if (path.includes('/meetings')) return 'Meetings';
        if (path.includes('/reports')) return 'Reports';
        if (path.includes('/admin')) return 'Admin Console';
        if (path.includes('/settings')) return 'Settings';
        if (path.includes('/help')) return 'Help & Support';
        return path || 'Unknown Page';
      } catch (e) {
        return log.metadata.url || 'Unknown Page';
      }
    }
    
    // For backend logs, try to extract endpoint or component info
    if (log.metadata?.endpoint) {
      // Map common endpoints to page names
      if (log.metadata.endpoint.includes('task')) {
        if (log.metadata.endpoint.includes('logger')) {
          return 'Task Logger Page';
        } else {
          return 'Task Modification & Activity Page';
        }
      }
      if (log.metadata.endpoint.includes('leave')) return 'Leave Management';
      if (log.metadata.endpoint.includes('meeting')) return 'Meetings';
      if (log.metadata.endpoint.includes('report')) return 'Reports';
      if (log.metadata.endpoint.includes('admin')) return 'Admin Console';
      if (log.metadata.endpoint.includes('setting')) return 'Settings';
      if (log.metadata.endpoint.includes('help')) return 'Help & Support';
      return log.metadata.endpoint;
    }
    
    if (log.metadata?.component) {
      // Map common components to page names
      if (log.metadata.component.includes('TaskLogger')) return 'Task Logger Page';
      if (log.metadata.component.includes('TaskManagement')) return 'Task Modification & Activity Page';
      if (log.metadata.component.includes('Leave')) return 'Leave Management';
      if (log.metadata.component.includes('Meeting')) return 'Meetings';
      if (log.metadata.component.includes('Report')) return 'Reports';
      if (log.metadata.component.includes('Admin')) return 'Admin Console';
      if (log.metadata.component.includes('Setting')) return 'Settings';
      if (log.metadata.component.includes('Help')) return 'Help & Support';
      return log.metadata.component;
    }
    
    // Default fallback
    return log.metadata?.source ? 'Frontend' : 'Backend';
  };

  const renderLogsTab = () => (
    <>
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <InfoIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" component="div">
                      {stats.total}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Total Logs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ErrorIcon sx={{ mr: 2, color: 'error.main' }} />
                    <Typography variant="h5" component="div">
                      {stats.errors}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Errors
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <WarningIcon sx={{ mr: 2, color: 'warning.main' }} />
                    <Typography variant="h5" component="div">
                      {stats.warnings}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Warnings
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <InfoIcon sx={{ mr: 2, color: 'info.main' }} />
                    <Typography variant="h5" component="div">
                      {stats.info}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Info
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <VisibilityIcon sx={{ mr: 2, color: 'secondary.main' }} />
                    <Typography variant="h5" component="div">
                      {stats.frontend}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Frontend
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={4} md={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <StorageIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="h5" component="div">
                      {stats.backend}
                    </Typography>
                  </Box>
                  <Typography color="text.secondary">
                    Backend
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchLogs}
                  fullWidth
                >
                  Refresh
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Log Level</InputLabel>
                  <Select 
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    label="Log Level"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="warn">Warning</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Source</InputLabel>
                  <Select 
                    value={filterSource}
                    onChange={(e) => setFilterSource(e.target.value)}
                    label="Source"
                  >
                    <MenuItem value="all">All Sources</MenuItem>
                    <MenuItem value="frontend">Frontend</MenuItem>
                    <MenuItem value="backend">Backend</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Filter by User"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Filter by Date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<DeleteIcon />}
                  onClick={clearLogs}
                  fullWidth
                >
                  Clear Logs
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Logs Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              System Logs
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Level</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Page</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs && logs.length > 0 ? (
                      logs.map((log) => (
                        <TableRow key={log.id || log.timestamp || log._id}>
                          <TableCell>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              icon={getLevelIcon(log.level)}
                              label={log.level || 'Unknown'}
                              color={getLevelColor(log.level)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={getSourceIcon(log.metadata?.source || 'backend')}
                              label={log.metadata?.source ? 'Frontend' : 'Backend'}
                              color={log.metadata?.source ? 'secondary' : 'primary'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{log.userId || log.metadata?.userId || log.user || log.username || 'System'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={getPageName(log)} 
                              size="small" 
                              color={log.metadata?.source ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{log.message || 'No message'}</TableCell>
                          <TableCell>
                            {log.metadata && (
                              <Typography variant="body2" color="text.secondary">
                                {typeof log.metadata === 'string' ? log.metadata : JSON.stringify(log.metadata)}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body1" color="text.secondary">
                            No logs found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  const renderAnalysisTab = () => (
    <Grid container spacing={3}>
      {analysis ? (
        <>
          {/* Overview Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div" color="error">
                      {analysis.byLevel?.error || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Errors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div" color="warning">
                      {analysis.byLevel?.warn || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Warnings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {analysis.frontendIssues?.errors || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Frontend Errors
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="div">
                      {analysis.migrationIssues?.total || 0}
                    </Typography>
                    <Typography color="text.secondary">
                      Migration Issues
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Error Analysis Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Error Analysis
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                        Missing Fields
                      </Typography>
                      <Typography variant="h4" component="div">
                        {errorAnalysis.missingFields.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Fields not visible or missing in UI
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="warning" sx={{ mb: 1 }}>
                        UI Issues
                      </Typography>
                      <Typography variant="h4" component="div">
                        {errorAnalysis.uiIssues.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        User interface problems
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" color="info" sx={{ mb: 1 }}>
                        API Errors
                      </Typography>
                      <Typography variant="h4" component="div">
                        {errorAnalysis.apiErrors.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        API request/response issues
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              
              {/* Specific Issue Tracking */}
              {(errorAnalysis.uiIssues.length > 0 || errorAnalysis.apiErrors.length > 0) && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Specific Issues Identified
                  </Typography>
                  
                  {errorAnalysis.uiIssues.filter(issue => issue.issueType).map((issue, index) => (
                    <Alert 
                      key={index} 
                      severity="warning" 
                      sx={{ mb: 2 }}
                      action={
                        <Button 
                          color="inherit" 
                          size="small"
                          onClick={() => {
                            // In a real implementation, this would navigate to the specific component
                            showSnackbar(`Issue identified in ${issue.component}: ${issue.description}`, 'info');
                          }}
                        >
                          View Details
                        </Button>
                      }
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {issue.issueType}
                      </Typography>
                      <Typography variant="body2">
                        Component: {issue.component}
                      </Typography>
                      <Typography variant="body2">
                        Description: {issue.description}
                      </Typography>
                    </Alert>
                  ))}
                  
                  {errorAnalysis.uiIssues.filter(issue => !issue.issueType).slice(0, 3).map((issue, index) => (
                    <Alert key={index} severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        UI Issue
                      </Typography>
                      <Typography variant="body2">
                        {issue.message}
                      </Typography>
                      {issue.metadata && (
                        <Typography variant="body2" color="text.secondary">
                          Details: {typeof issue.metadata === 'string' ? issue.metadata : JSON.stringify(issue.metadata)}
                        </Typography>
                      )}
                    </Alert>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* API Activity */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                API Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    <strong>Total Requests:</strong> {analysis.apiActivity?.totalRequests || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    <strong>API Errors:</strong> {analysis.apiActivity?.errors || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body1">
                    <strong>Methods:</strong> {Object.keys(analysis.apiActivity?.byMethod || {}).length}
                  </Typography>
                </Grid>
              </Grid>
              
              {analysis.apiActivity?.byMethod && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Requests by Method:
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(analysis.apiActivity.byMethod).map(([method, count]) => (
                      <Grid item key={method}>
                        <Chip 
                          label={`${method}: ${count}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Frontend Issues */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                <VisibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Frontend Issues
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body1">
                    <strong>Total Frontend Logs:</strong> {analysis.frontendIssues?.total || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body1">
                    <strong>Field Issues:</strong> {analysis.frontendIssues?.fieldIssues || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body1">
                    <strong>API Errors:</strong> {analysis.frontendIssues?.apiErrors || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body1">
                    <strong>Component Errors:</strong> {analysis.frontendIssues?.componentErrors || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Common Errors */}
          {analysis.commonErrors && analysis.commonErrors.length > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Common Errors
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Error Message</TableCell>
                        <TableCell>Count</TableCell>
                        <TableCell>Examples</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analysis.commonErrors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.message}</TableCell>
                          <TableCell>{error.count}</TableCell>
                          <TableCell>
                            {error.examples && error.examples.map((example, i) => (
                              <Typography key={i} variant="body2" color="text.secondary">
                                {new Date(example.timestamp).toLocaleString()}
                              </Typography>
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
          
          {/* Migration Issues */}
          {analysis.migrationIssues && analysis.migrationIssues.total > 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  <StorageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Migration Issues
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Total Migration Issues:</strong> {analysis.migrationIssues.total}
                  <br />
                  <strong>Errors:</strong> {analysis.migrationIssues.errors}
                  <br />
                  <strong>Warnings:</strong> {analysis.migrationIssues.warnings}
                </Typography>
                
                {analysis.migrationIssues.details && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Recent Migration Logs:
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Message</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analysis.migrationIssues.details.map((log, index) => (
                            <TableRow key={index}>
                              <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={log.level} 
                                  size="small" 
                                  color={getLevelColor(log.level)}
                                />
                              </TableCell>
                              <TableCell>{log.message}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Paper>
            </Grid>
          )}
        </>
      ) : (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Error Monitoring
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Track and monitor system errors and issues in real-time
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Logs" />
          <Tab label="Analysis" />
        </Tabs>
      </Paper>

      <Divider sx={{ mb: 3 }} />

      {activeTab === 0 ? renderLogsTab() : renderAnalysisTab()}

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ErrorMonitoring;