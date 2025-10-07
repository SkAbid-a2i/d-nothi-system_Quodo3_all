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
  Button,
  ToggleButton,
  ToggleButtonGroup
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
  Person as PersonIcon,
  People as PeopleIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'team'
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Chart data states
  const [officeData, setOfficeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [taskTrendData, setTaskTrendData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  
  // Date range states for custom filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [applyFilters, setApplyFilters] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
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
      
      setTasks(tasksData);
      setLeaves(leavesData);
      setAllUsers(usersData);
      setFilteredUsers(usersData);
      
      // Filter data based on user role and view mode
      let filteredTasks = [...tasksData];
      
      if (user.role === 'Agent') {
        // Agents only see their own data
        filteredTasks = tasksData.filter(task => 
          task.userId === user.id || task.userName === user.username
        );
      } else if (user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor') {
        // Admin roles can switch between individual and team view
        if (viewMode === 'individual') {
          // Show only their own data
          filteredTasks = tasksData.filter(task => 
            task.userId === user.id || task.userName === user.username
          );
        } else if (viewMode === 'team' && selectedUser) {
          // Show selected user's data
          filteredTasks = tasksData.filter(task => 
            task.userId === selectedUser.id || task.userName === selectedUser.username
          );
        }
        // For team view without selected user, show all data
      }
      
      // Apply date filters if applied
      if (applyFilters && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = new Date(task.date);
          return taskDate >= start && taskDate <= end;
        });
      }
      
      // Process chart data
      processChartData(filteredTasks, timeRange);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showSnackbar('Error fetching dashboard data: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  }, [user, viewMode, timeRange, startDate, endDate, applyFilters, selectedUser]);

  // Process chart data based on filters
  const processChartData = (tasksData, timeRange) => {
    // Office distribution data
    const officeCount = {};
    tasksData.forEach(task => {
      const office = task.office || 'Unknown';
      officeCount[office] = (officeCount[office] || 0) + 1;
    });
    setOfficeData(Object.keys(officeCount).map(office => ({
      name: office,
      value: officeCount[office]
    })));
    
    // Category distribution data
    const categoryCount = {};
    tasksData.forEach(task => {
      const category = task.category || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    setCategoryData(Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category]
    })));
    
    // Service distribution data
    const serviceCount = {};
    tasksData.forEach(task => {
      const service = task.service || 'Unknown';
      serviceCount[service] = (serviceCount[service] || 0) + 1;
    });
    setServiceData(Object.keys(serviceCount).map(service => ({
      name: service,
      value: serviceCount[service]
    })));
    
    // Source distribution data
    const sourceCount = {};
    tasksData.forEach(task => {
      const source = task.source || 'Unknown';
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });
    setSourceData(Object.keys(sourceCount).map(source => ({
      name: source,
      value: sourceCount[source]
    })));
    
    // Performance data (tasks by status)
    const statusCount = {};
    tasksData.forEach(task => {
      const status = task.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    setPerformanceData(Object.keys(statusCount).map(status => ({
      name: status,
      value: statusCount[status]
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
        const count = tasksData.filter(task => task.date === dateStr).length;
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
        
        const count = tasksData.filter(task => {
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
        
        const count = tasksData.filter(task => {
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
        const count = tasksData.filter(task => {
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

  const handleApplyFilters = () => {
    setApplyFilters(true);
    fetchDashboardData();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setApplyFilters(false);
    setSelectedUser(null);
    fetchDashboardData();
  };

  const getDashboardStats = () => {
    // Filter tasks based on current view
    let filteredTasks = tasks;
    let filteredLeaves = leaves;
    
    if (user.role === 'Agent') {
      filteredTasks = tasks.filter(task => 
        task.userId === user.id || task.userName === user.username
      );
      filteredLeaves = leaves.filter(leave => 
        leave.userId === user.id || leave.userName === user.username
      );
    } else if (user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor') {
      if (viewMode === 'individual') {
        filteredTasks = tasks.filter(task => 
          task.userId === user.id || task.userName === user.username
        );
        filteredLeaves = leaves.filter(leave => 
          leave.userId === user.id || leave.userName === user.username
        );
      } else if (viewMode === 'team' && selectedUser) {
        filteredTasks = tasks.filter(task => 
          task.userId === selectedUser.id || task.userName === selectedUser.username
        );
        filteredLeaves = leaves.filter(leave => 
          leave.userId === selectedUser.id || leave.userName === selectedUser.username
        );
      }
    }
    
    // Apply date filters if applied
    if (applyFilters && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });
      filteredLeaves = filteredLeaves.filter(leave => {
        const leaveDate = new Date(leave.startDate || leave.date);
        return leaveDate >= start && leaveDate <= end;
      });
    }
    
    return {
      totalTasks: filteredTasks.length,
      pendingTasks: filteredTasks.filter(task => task.status === 'Pending').length,
      completedTasks: filteredTasks.filter(task => task.status === 'Completed').length,
      inProgressTasks: filteredTasks.filter(task => task.status === 'In Progress').length,
      pendingLeaves: filteredLeaves.filter(leave => leave.status === 'Pending').length,
      approvedLeaves: filteredLeaves.filter(leave => leave.status === 'Approved').length
    };
  };

  const stats = getDashboardStats();
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f59e0b', '#10b981', '#ef4444'];

  // Render different chart types
  const renderTaskTrendChart = () => {
    switch (chartType) {
      case 'bar':
        return (
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
        );
      case 'line':
        return (
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
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
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
              <Area 
                type="monotone" 
                dataKey="tasks" 
                stroke="#667eea" 
                fill="#667eea" 
                fillOpacity={0.3}
                name="Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return (
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
        );
    }
  };

  // Ensure we have a user before rendering
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {/* View Mode Toggle for Admin Roles */}
      {(user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor') && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="individual" aria-label="individual view">
                <PersonIcon sx={{ mr: 1 }} />
                Individual
              </ToggleButton>
              <ToggleButton value="team" aria-label="team view">
                <PeopleIcon sx={{ mr: 1 }} />
                Team
              </ToggleButton>
            </ToggleButtonGroup>
            
            {viewMode === 'team' && (
              <Autocomplete
                sx={{ minWidth: 200 }}
                options={allUsers}
                getOptionLabel={(option) => option.fullName || option.username || 'Unknown User'}
                value={selectedUser}
                onChange={(event, newValue) => setSelectedUser(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select User" size="small" />
                )}
              />
            )}
          </Box>
        </Paper>
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <FilterIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                startIcon={<FilterIcon />} 
                onClick={handleApplyFilters}
                variant="contained"
                size="small"
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)'
                  }
                }}
              >
                Apply
              </Button>
              <Button 
                startIcon={<ClearIcon />} 
                onClick={handleClearFilters}
                variant="outlined"
                size="small"
              >
                Clear
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
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
                <IconButton 
                  color={chartType === 'area' ? 'primary' : 'default'}
                  onClick={() => setChartType('area')}
                  size="small"
                >
                  <ShowChartIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Box sx={{ height: 350 }}>
              {renderTaskTrendChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Performance Chart */}
        <Grid item xs={12} md={6} lg={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Task Performance
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke="#667eea" 
                    fill="#667eea" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ccc',
                      borderRadius: 4
                    }}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
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
                <BarChart
                  data={categoryData}
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
                    dataKey="value" 
                    fill="#764ba2" 
                    name="Categories"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
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
                <BarChart
                  data={sourceData}
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
                    dataKey="value" 
                    fill="#f093fb" 
                    name="Sources"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
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