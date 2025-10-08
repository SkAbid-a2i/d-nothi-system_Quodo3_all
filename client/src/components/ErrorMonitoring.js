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
import { logAPI } from '../services/api';
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
  const [realtime, setRealtime] = useState(false);

  const stats = {
    total: logs.length,
    errors: logs.filter(log => log.level === 'error').length,
    warnings: logs.filter(log => log.level === 'warn').length,
    info: logs.filter(log => log.level === 'info').length,
    success: logs.filter(log => log.level === 'success').length,
    frontend: logs.filter(log => log.metadata?.source === 'frontend').length,
    backend: logs.filter(log => !log.metadata?.source || log.metadata?.source !== 'frontend').length
  };

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

  const toggleRealtime = () => {
    setRealtime(!realtime);
    showSnackbar(`Real-time monitoring ${!realtime ? 'enabled' : 'disabled'}`, 'info');
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

  // Real-time polling
  useEffect(() => {
    let interval;
    if (realtime && activeTab === 0) {
      interval = setInterval(() => {
        fetchLogs();
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(interval);
  }, [realtime, activeTab]);

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
                  variant={realtime ? "contained" : "outlined"}
                  startIcon={<RefreshIcon />}
                  onClick={toggleRealtime}
                  fullWidth
                >
                  {realtime ? 'Stop Realtime' : 'Start Realtime'}
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
                        <TableCell colSpan={6} align="center">
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