import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Divider
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Notifications,
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { taskAPI, leaveAPI, userAPI } from '../services/api';
import notificationService from '../services/notificationService';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [userFilter, setUserFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch tasks
      const tasksResponse = await taskAPI.getAllTasks();
      setTasks(tasksResponse.data || []);
      
      // Fetch leaves
      const leavesResponse = await leaveAPI.getAllLeaves();
      setLeaves(leavesResponse.data || []);
      
      // Fetch users
      const usersResponse = await userAPI.getAllUsers();
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showSnackbar('Error fetching dashboard data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      console.log('Task created notification received:', data);
      showSnackbar(`New task created: ${data.task.description}`, 'info');
      fetchDashboardData(); // Refresh data
    };

    const handleTaskUpdated = (data) => {
      console.log('Task updated notification received:', data);
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
      fetchDashboardData(); // Refresh data
    };

    const handleLeaveRequested = (data) => {
      console.log('Leave requested notification received:', data);
      showSnackbar(`New leave request from ${data.leave.userName}`, 'info');
      fetchDashboardData(); // Refresh data
    };

    const handleLeaveApproved = (data) => {
      console.log('Leave approved notification received:', data);
      showSnackbar(`Leave request approved`, 'success');
      fetchDashboardData(); // Refresh data
    };

    const handleLeaveRejected = (data) => {
      console.log('Leave rejected notification received:', data);
      showSnackbar(`Leave request rejected`, 'warning');
      fetchDashboardData(); // Refresh data
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);
    notificationService.onLeaveRequested(handleLeaveRequested);
    notificationService.onLeaveApproved(handleLeaveApproved);
    notificationService.onLeaveRejected(handleLeaveRejected);

    // Cleanup on unmount
    return () => {
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
      notificationService.off('leaveRequested', handleLeaveRequested);
      notificationService.off('leaveApproved', handleLeaveApproved);
      notificationService.off('leaveRejected', handleLeaveRejected);
    };
  }, [fetchDashboardData]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`);
    showSnackbar(`Exporting data as ${format}`, 'info');
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approveLeave(leaveId);
      showSnackbar('Leave request approved successfully!', 'success');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving leave:', error);
      showSnackbar('Error approving leave: ' + error.message, 'error');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveAPI.rejectLeave(leaveId, { rejectionReason: 'Rejected by admin' });
      showSnackbar('Leave request rejected successfully!', 'success');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting leave:', error);
      showSnackbar('Error rejecting leave: ' + error.message, 'error');
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get today's leaves
  const getTodaysLeaves = () => {
    const today = new Date().toISOString().split('T')[0];
    return leaves.filter(leave => {
      const startDate = leave.startDate ? leave.startDate.split('T')[0] : '';
      const endDate = leave.endDate ? leave.endDate.split('T')[0] : '';
      return startDate <= today && endDate >= today && leave.status === 'Approved';
    });
  };

  // Get team performance data
  const getTeamPerformanceData = () => {
    if (!tasks || tasks.length === 0) return [];
    
    // Group tasks by user
    const userTaskCount = {};
    tasks.forEach(task => {
      const userName = task.userName || 'Unknown User';
      userTaskCount[userName] = (userTaskCount[userName] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.keys(userTaskCount).map(userName => ({
      name: userName,
      tasks: userTaskCount[userName]
    }));
  };

  // Get task distribution data
  const getTaskDistributionData = () => {
    if (!tasks || tasks.length === 0) return [];
    
    // Group tasks by category
    const categoryCount = {};
    tasks.forEach(task => {
      const category = task.category || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.keys(categoryCount).map(category => ({
      name: category,
      count: categoryCount[category]
    }));
  };

  // Filter team tasks based on search and user filter
  const filteredTeamTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.service && task.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.userName && task.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesUser = !userFilter || 
      (task.userName && task.userName.toLowerCase().includes(userFilter.toLowerCase()));
    
    return matchesSearch && matchesUser;
  });

  // Filter pending leaves
  const filteredPendingLeaves = leaves.filter(leave => 
    leave.status === 'Pending' && 
    (!searchTerm || 
      (leave.userName && leave.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Get dashboard statistics
  const getDashboardStats = () => {
    return {
      totalTasks: tasks.length,
      pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
      approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
      todaysLeaves: getTodaysLeaves().length,
      totalUsers: users.length
    };
  };

  const stats = getDashboardStats();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Admin Dashboard
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Key Metrics Cards - First Row */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Tasks
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalTasks}
                      </Typography>
                    </Box>
                    <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Pending Leaves
                      </Typography>
                      <Typography variant="h4">
                        {stats.pendingLeaves}
                      </Typography>
                    </Box>
                    <EventAvailable sx={{ fontSize: 40, color: 'secondary.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        On Leave Today
                      </Typography>
                      <Typography variant="h4">
                        {stats.todaysLeaves}
                      </Typography>
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Users
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                    <GroupIcon sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Approved Leaves
                      </Typography>
                      <Typography variant="h4">
                        {stats.approvedLeaves}
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" fullWidth>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Charts Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Task Distribution - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </Typography>
              <Box>
                <IconButton 
                  color={chartType === 'pie' ? 'primary' : 'default'}
                  onClick={() => setChartType('pie')}
                  size="small"
                >
                  <PieChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'bar' ? 'primary' : 'default'}
                  onClick={() => setChartType('bar')}
                  size="small"
                >
                  <BarChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'line' ? 'primary' : 'default'}
                  onClick={() => setChartType('line')}
                  size="small"
                >
                  <LineChartIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ height: 300 }}>
              {chartType === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getTaskDistributionData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="Task Count" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTaskDistributionData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTaskDistributionData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
              
              {chartType === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getTaskDistributionData()}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Task Count" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Team Performance Section */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Team Performance
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)' }}>
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={getTeamPerformanceData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="tasks"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getTeamPerformanceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '70%' }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Performance Summary:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                    <Typography variant="h6">
                      {users.length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Active Tasks
                    </Typography>
                    <Typography variant="h6">
                      {tasks.filter(t => t.status !== 'Completed').length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {tasks.filter(t => t.status === 'Completed').length}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Pending Leaves
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {leaves.filter(l => l.status === 'Pending').length}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Filters and Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Time Range</InputLabel>
                  <Select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    label="Time Range"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Filter by User"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon fontSize="small" />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('CSV')}
                    variant="outlined"
                    size="small"
                  >
                    Export CSV
                  </Button>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('PDF')}
                    variant="outlined"
                    size="small"
                  >
                    Export PDF
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Data Tables */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
              <Tab label="Team Tasks" icon={<Assignment />} iconPosition="start" />
              <Tab label="Pending Leaves" icon={<EventAvailable />} iconPosition="start" />
              <Tab label="Who's on Leave Today" icon={<CalendarIcon />} iconPosition="start" />
            </Tabs>
            
            <Box sx={{ mt: 2 }}>
              {activeTab === 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTeamTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.userName || 'N/A'}</TableCell>
                          <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{task.source || 'N/A'}</TableCell>
                          <TableCell>{task.category || 'N/A'}</TableCell>
                          <TableCell>{task.service || 'N/A'}</TableCell>
                          <TableCell>{task.description || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={task.status || 'Pending'} 
                              size="small"
                              color={
                                task.status === 'Completed' ? 'success' : 
                                task.status === 'In Progress' ? 'primary' : 
                                task.status === 'Cancelled' ? 'error' : 'default'
                              } 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {activeTab === 1 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPendingLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.userName || 'N/A'}</TableCell>
                          <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.reason || 'N/A'}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleRejectLeave(leave.id)}
                            >
                              <CloseIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {activeTab === 2 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getTodaysLeaves().map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.userName || 'N/A'}</TableCell>
                          <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.reason || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
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

export default AdminDashboard;