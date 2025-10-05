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
  CircularProgress, 
  Alert, 
  Tabs, 
  Tab, 
  Chip,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import { Database as DatabaseIcon, TableChart as TableIcon } from '@mui/icons-material';
import { databaseAPI } from '../services/databaseAPI';
import { useAuth } from '../contexts/AuthContext';

const DatabaseViewer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [tableDetails, setTableDetails] = useState({});

  const fetchDatabaseInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await databaseAPI.getDatabaseInfo();
      setDatabaseInfo(response.data);
    } catch (error) {
      console.error('Error fetching database info:', error);
      setError('Failed to fetch database information: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchTableInfo = async (tableName) => {
    if (tableDetails[tableName]) return; // Already fetched
    
    try {
      const response = await databaseAPI.getTableInfo(tableName);
      setTableDetails(prev => ({
        ...prev,
        [tableName]: response.data
      }));
    } catch (error) {
      console.error(`Error fetching table info for ${tableName}:`, error);
      setTableDetails(prev => ({
        ...prev,
        [tableName]: { error: 'Failed to fetch table information' }
      }));
    }
  };

  useEffect(() => {
    if (user && user.role === 'SystemAdmin') {
      fetchDatabaseInfo();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (user && user.role !== 'SystemAdmin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Database viewing is only available for System Administrators.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        <DatabaseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Database Information
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {databaseInfo && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Database Connection
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography><strong>Name:</strong> {databaseInfo.database.name}</Typography>
                  <Typography><strong>Host:</strong> {databaseInfo.database.host}</Typography>
                  <Typography><strong>Port:</strong> {databaseInfo.database.port}</Typography>
                  <Typography><strong>Dialect:</strong> {databaseInfo.database.dialect}</Typography>
                  <Typography><strong>Status:</strong> 
                    <Chip 
                      label={databaseInfo.database.connected ? 'Connected' : 'Disconnected'} 
                      color={databaseInfo.database.connected ? 'success' : 'error'} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Data Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {Object.entries(databaseInfo.modelCounts).map(([model, count]) => (
                    <Typography key={model}>
                      <strong>{model}:</strong> {count} records
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {databaseInfo && (
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Tables" icon={<TableIcon />} />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Database Tables
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Table Name</TableCell>
                    <TableCell>Record Count</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(databaseInfo.modelCounts).map(([tableName, count]) => (
                    <TableRow 
                      key={tableName} 
                      hover
                      onClick={() => fetchTableInfo(tableName)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{tableName}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell>
                        <Chip 
                          label={tableDetails[tableName] ? 'Details Loaded' : 'Click for Details'} 
                          color={tableDetails[tableName] ? 'success' : 'default'} 
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {Object.keys(tableDetails).map(tableName => (
              <Box key={tableName} sx={{ mt: 3, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {tableName} Structure
                </Typography>
                
                {tableDetails[tableName].error ? (
                  <Alert severity="error">{tableDetails[tableName].error}</Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Column</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Allow Null</TableCell>
                          <TableCell>Primary Key</TableCell>
                          <TableCell>Default</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(tableDetails[tableName].columns).map(([columnName, columnInfo]) => (
                          <TableRow key={columnName}>
                            <TableCell><strong>{columnName}</strong></TableCell>
                            <TableCell>{columnInfo.type}</TableCell>
                            <TableCell>{columnInfo.allowNull ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{columnInfo.primaryKey ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{columnInfo.defaultValue || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default DatabaseViewer;