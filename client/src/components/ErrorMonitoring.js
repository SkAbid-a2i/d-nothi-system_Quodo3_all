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
  CardContent
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
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
  const [filterUser, setFilterUser] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
    success: 0
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await logAPI.getLogs({
        level: filterLevel !== 'all' ? filterLevel : undefined,
        user: filterUser || undefined,
        date: filterDate || undefined
      });
      
      setLogs(response.data || []);
      
      // Calculate statistics
      const logsData = response.data || [];
      const errors = logsData.filter(log => log.level === 'error').length;
      const warnings = logsData.filter(log => log.level === 'warn').length;
      const info = logsData.filter(log => log.level === 'info').length;
      const success = logsData.filter(log => log.level === 'success').length;
      
      setStats({
        total: logsData.length,
        errors,
        warnings,
        info,
        success
      });
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to fetch logs: ' + (err.response?.data?.message || err.message));
      showSnackbar('Failed to fetch logs', 'error');
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

  const clearLogs = async () => {
    try {
      // In a real implementation, you would call an API to clear logs
      setLogs([]);
      setStats({
        total: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        success: 0
      });
      showSnackbar('Logs cleared successfully', 'success');
    } catch (err) {
      console.error('Error clearing logs:', err);
      showSnackbar('Failed to clear logs', 'error');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterLevel, filterUser, filterDate]);

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
          Track and monitor system errors and issues
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

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={2}>
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
        
        <Grid item xs={12} md={2}>
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
        
        <Grid item xs={12} md={2}>
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
        
        <Grid item xs={12} md={2}>
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
        
        <Grid item xs={12} md={2}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SuccessIcon sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  {stats.success}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Success
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={2}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchLogs}
            fullWidth
            sx={{ height: '100%' }}
          >
            Refresh
          </Button>
        </Grid>

        {/* Filters */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
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
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Filter by User"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Filter by Date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
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
                      <TableCell>User</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={getLevelIcon(log.level)}
                            label={log.level}
                            color={getLevelColor(log.level)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.user || 'System'}</TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>
                          {log.details && (
                            <Typography variant="body2" color="text.secondary">
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

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