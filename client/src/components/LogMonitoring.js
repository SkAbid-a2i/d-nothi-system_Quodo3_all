import React, { useState, useEffect, useCallback } from 'react';
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
  Tabs, 
  Tab, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { logAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import frontendLogger from '../services/frontendLogger';

const LogMonitoring = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logLevel, setLogLevel] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [analysis, setAnalysis] = useState(null);

  const fetchLogs = useCallback(async () => {
    if (user?.role !== 'SystemAdmin') {
      setError('Access denied. Only SystemAdmin users can view logs.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (activeTab === 0) {
        response = await logAPI.getRecentLogs();
      } else if (activeTab === 1) {
        response = await logAPI.getLogs({ level: logLevel === 'all' ? undefined : logLevel });
      } else {
        response = await logAPI.analyzeLogs({ hours: timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720 });
      }
      
      if (activeTab === 2) {
        setAnalysis(response.data);
      } else {
        setLogs(response.data.logs || response.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError('Failed to fetch logs: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [activeTab, logLevel, timeRange, user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportLogs = () => {
    frontendLogger.exportLogs();
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'error';
      case 'warn': return 'warning';
      case 'info': return 'info';
      case 'debug': return 'default';
      default: return 'default';
    }
  };

  if (user?.role !== 'SystemAdmin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Access denied. Only SystemAdmin users can access log monitoring.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        System Log Monitoring
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Recent Logs" />
          <Tab label="All Logs" />
          <Tab label="Log Analysis" />
        </Tabs>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {activeTab === 0 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Recent Logs</Typography>
            <Button variant="outlined" onClick={handleExportLogs}>
              Export Frontend Logs
            </Button>
          </Box>
          
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
                    <TableCell>Message</TableCell>
                    <TableCell>Metadata</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.level} 
                          color={getLevelColor(log.level)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        ) : (
                          'No metadata'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Log Level</InputLabel>
              <Select
                value={logLevel}
                onChange={(e) => setLogLevel(e.target.value)}
                label="Log Level"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="warn">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="debug">Debug</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
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
                    <TableCell>Message</TableCell>
                    <TableCell>Metadata</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={log.level} 
                          color={getLevelColor(log.level)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <pre style={{ fontSize: '0.8rem', margin: 0 }}>
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        ) : (
                          'No metadata'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : analysis ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Log Analysis Summary
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {analysis.total}
                  </Typography>
                  <Typography>Total Logs</Typography>
                </Paper>
                
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="error">
                    {analysis.byLevel.error}
                  </Typography>
                  <Typography>Errors</Typography>
                </Paper>
                
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning">
                    {analysis.byLevel.warn}
                  </Typography>
                  <Typography>Warnings</Typography>
                </Paper>
                
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info">
                    {analysis.byLevel.info}
                  </Typography>
                  <Typography>Info</Typography>
                </Paper>
              </Box>
              
              {analysis.commonErrors && analysis.commonErrors.length > 0 && (
                <Paper sx={{ p: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Most Common Errors
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
                              {error.examples.map((example, exIndex) => (
                                <div key={exIndex}>
                                  {new Date(example.timestamp).toLocaleString()}
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
              
              {analysis.apiActivity && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    API Activity
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h5">{analysis.apiActivity.totalRequests}</Typography>
                      <Typography>Total Requests</Typography>
                    </Paper>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h5" color="error">
                        {analysis.apiActivity.errors}
                      </Typography>
                      <Typography>API Errors</Typography>
                    </Paper>
                  </Box>
                  
                  {Object.keys(analysis.apiActivity.byMethod).length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Requests by Method
                      </Typography>
                      {Object.entries(analysis.apiActivity.byMethod).map(([method, count]) => (
                        <Typography key={method} variant="body2">
                          {method}: {count}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Paper>
              )}
            </Box>
          ) : (
            <Typography>No analysis data available</Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default LogMonitoring;