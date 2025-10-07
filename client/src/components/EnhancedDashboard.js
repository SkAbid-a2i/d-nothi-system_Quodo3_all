import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Autocomplete,
  Tabs,
  Tab,
  Divider,
  Button
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Group as GroupIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Source as SourceIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon
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
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [users, setUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'team'
  
  // Chart data states
  const [officeData, setOfficeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [taskTrendData, setTaskTrendData] = useState([]);
  
  // Date range states for custom filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data
      const [tasksResponse, leavesResponse, usersResponse] = await Promise.all([
        taskAPI.getAllTasks(),
        leaveAPI.getAllLeaves(),
        userAPI.getAllUsers()
      ]);
      
      // Process tasks data
      let tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : 
                      tasksResponse.data?.data || tasksResponse.data || [];
      
      // Process leaves data
      let leavesData = Array.isArray(leavesResponse.data) ? leavesResponse.data : 
                       leavesResponse.data?.data || leavesResponse.data || [];
      
      // Process users data
      let usersData = Array.isArray(usersResponse.data) ? usersResponse.data : 
                      usersResponse.data?.data || usersResponse.data || [];
      
      // Filter data based on user role and view mode
      if (user.role === 'Agent') {
        // Agents only see their own data
        tasksData = tasksData.filter(task => 
          task.userId === user.id || task.userName === user.username
        );
        leavesData = leavesData.filter(leave => 
          leave.userId === user.id || leave.userName === user.username
        );
      } else if (user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor') {
        // Admin roles can switch between individual and team view
        if (viewMode === 'individual') {
          // Show only their own data
          tasksData = tasksData.filter(task => 
            task.userId === user.id || task.userName === user.username
          );
          leavesData = leavesData.filter(leave => 
            leave.userId === user.id || leave.userName === user.username
          );
        }
        // For Admin/Supervisor, show office data
        else if (viewMode === 'team' && (user.role === 'Admin' || user.role === 'Supervisor')) {
          tasksData = tasksData.filter(task => task.office === user.office);
          leavesData = leavesData.filter(leave => leave.office === user.office);
        }
      }
      
      setTasks(tasksData);
      setLeaves(leavesData);
      setUsers(usersData.map(u => ({
        id: u.id,
        label: `${u.fullName || u.username} (${u.username})`,
        value: u.username
      })));
      
      // Process chart data
      processChartData(tasksData, timeRange, startDate, endDate);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showSnackbar('Error fetching dashboard data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user.id, user.role, user.username, user.office, viewMode, timeRange, startDate, endDate]);

  // Process chart data based on filters
  const processChartData = (tasksData, timeRange, startDate, endDate) => {
    // Filter by date range if custom dates are provided
    let filteredTasks = [...tasksData];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });
    }
    
    // Office distribution data
    const officeCount = {};
    filteredTasks.forEach(task => {
      const office = task.office || 'Unknown';
      officeCount[office] = (officeCount[office] || 0) + 1;
    });
    setOfficeData(Object.keys(officeCount).map(office => ({
      name: office,
      value: officeCount[office]
    })));
    
    // Category distribution data
    const categoryCount = {};
    filteredTasks.forEach(task => {
      const category = task.category || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    setCategoryData(Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category]
    })));
    
    // Service distribution data
    const serviceCount = {};
    filteredTasks.forEach(task => {
      const service = task.service || 'Unknown';
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    });
    setServiceData(Object.keys(serviceCount).map(service => ({
      name: service,
      value: serviceCount[service]
    })));
    
    // Source distribution data
    const sourceCount = {};
    filteredTasks.forEach(task => {
      const source = task.source || 'Unknown';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    setSourceData(Object.keys(sourceCount).map(source => ({
      name: source,
      value: sourceCount[source]
    })));
    
    // Task trend data (based on time range)
    let trendData = [];
    const now = new Date();
    
    if (timeRange === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = filteredTasks.filter(task => task.date === dateStr).length;
        trendData.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: dateStr,
          tasks: count
        });
      }
    } else if (timeRange === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const count = filteredTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= weekStart && taskDate <= weekEnd;
        }).length;
        
        trendData.push({
          name: `Week ${4-i}`,
          tasks: count
        });
      }
    } else if (timeRange === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        
        const count = filteredTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.getMonth() === date.getMonth() && taskDate.getFullYear() === year;
        }).length;
        
        trendData.push({
          name: `${month} ${year}`,
          tasks: count
        });
      }
    } else if (timeRange === 'yearly') {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const year = new Date(now).getFullYear() - i;
        const count = filteredTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate.getFullYear() === year;
        }).length;
        
        trendData.push({
          name: year.toString(),
          tasks: count
        });
      }
    }
    
    setTaskTrendData(trendData);
  };

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchDashboardData();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('EnhancedDashboard', 'dashboard', fetchDashboardData, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('EnhancedDashboard');
    };
  }, [fetchDashboardData]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      showSnackbar(`New task created: ${data.task.description}`, 'info');
      fetchDashboardData();
    };

    const handleTaskUpdated = (data) => {
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
      fetchDashboardData();
    };

    const handleLeaveRequested = (data) => {
      showSnackbar(`New leave request from ${data.leave.userName}`, 'info');
      fetchDashboardData();
    };

    const handleLeaveApproved = (data) => {
      showSnackbar(`Leave request approved`, 'success');
      fetchDashboardData();
    };

    const handleLeaveRejected = (data) => {
      showSnackbar(`Leave request rejected`, 'warning');
      fetchDashboardData();
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
    showSnackbar(`Exporting data as ${format.toUpperCase()}...`, 'info');
    // In a real implementation, you would generate and download the export file
  };
  const getDashboardStats = () => {
    return {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(task => task.status === 'Pending').length,
      completedTasks: tasks.filter(task => task.status === 'Completed').length,
      inProgressTasks: tasks.filter(task => task.status === 'In Progress').length,
      pendingLeaves: leaves.filter(leave => leave.status === 'Pending').length,
      approvedLeaves: leaves.filter(leave => leave.status === 'Approved').length
    };
  };

  const stats = getDashboardStats();
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
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
          Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Welcome back, {user?.fullName || user?.username}!
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea20 0%, #667eea10 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
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
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f59e0b20 0%, #f59e0b10 100%)',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Pending Tasks
                  </Typography>
                  <Typography variant="h4">
                    {stats.pendingTasks}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #10b98120 0%, #10b98110 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Completed Tasks
                  </Typography>
                  <Typography variant="h4">
                    {stats.completedTasks}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb20 0%, #f093fb10 100%)',
            border: '1px solid rgba(240, 147, 251, 0.2)'
          }}>
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
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #764ba220 0%, #764ba210 100%)',
            border: '1px solid rgba(118, 75, 162, 0.2)'
          }}>
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
                <EventAvailable sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
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
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Task Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Task Trends
              </Typography>
              <Box>
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
            
            <Box sx={{ height: 350 }}>
              {chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={taskTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: 4
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="tasks" 
                      fill="#667eea" 
                      name="Tasks"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={taskTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid #ccc',
                        borderRadius: 4
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="#667eea" 
                      activeDot={{ r: 8 }} 
                      name="Tasks"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Office Distribution Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Office Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={officeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {officeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Category Distribution Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Category Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Service Distribution Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Service Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
        {/* Source Distribution Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <SourceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Source Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
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

export default EnhancedDashboard;