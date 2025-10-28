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
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as ShowChartIcon,
  Timeline as LineChartIcon,
  Group as GroupIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Source as SourceIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  People as PeopleIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  DonutLarge as DonutIcon,
  Radar as RadarIcon
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
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar
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
  
  // Chart type states for each section
  const [taskPerformanceChartType, setTaskPerformanceChartType] = useState('radar');
  const [officeChartType, setOfficeChartType] = useState('pie');
  const [categoryChartType, setCategoryChartType] = useState('bar');
  const [serviceChartType, setServiceChartType] = useState('pie');
  
  // Chart data states
  const [officeData, setOfficeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [taskTrendData, setTaskTrendData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  const [obligationData, setObligationData] = useState([]);
  
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
    
    // Obligation distribution data
    const obligationCount = {};
    tasksData.forEach(task => {
      const obligation = task.obligation || 'Unknown';
      obligationCount[obligation] = (obligationCount[obligation] || 0) + 1;
    });
    setObligationData(Object.keys(obligationCount).map(obligation => ({
      name: obligation,
      value: obligationCount[obligation]
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

  const handleExport = async (format) => {
    try {
      // Show loading state
      setLoading(true);
      showSnackbar(`Exporting data as ${format.toUpperCase()}...`, 'info');
      
      // Prepare data for export
      let exportData = {
        generatedAt: new Date().toISOString(),
        user: user?.username || 'Unknown',
        reportType: 'Dashboard'
      };
      
      // Add tasks and leaves data
      exportData.tasks = tasks;
      exportData.leaves = leaves;
      
      // Create export content based on format
      let content, mimeType, filename;
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvContent = convertToCSV(exportData);
        content = csvContent;
        mimeType = 'text/csv;charset=utf-8;';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.${format}`;
      } else if (format === 'xlsx') {
        // For Excel, we'll create CSV content (simpler approach)
        const csvContent = convertToCSV(exportData);
        content = csvContent;
        mimeType = 'application/vnd.ms-excel;charset=utf-8;';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.${format}`;
      } else if (format === 'pdf') {
        // For PDF, we'll create a properly formatted text representation
        const pdfContent = convertToPDF(exportData);
        content = pdfContent;
        mimeType = 'application/pdf;charset=utf-8;';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.${format}`;
      } else {
        // Default to JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json;charset=utf-8;';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.json`;
      }
      
      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showSnackbar(`Dashboard exported as ${format.toUpperCase()} successfully!`, 'success');
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      showSnackbar(`Failed to export dashboard as ${format.toUpperCase()}: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
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

  // Render different chart types for task trends
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="tasks" 
                stroke="#667eea" 
                activeDot={{ r: 8 }} 
                name="Tasks"
                strokeWidth={3}
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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

  // Render different chart types for task performance
  const renderTaskPerformanceChart = () => {
    switch (taskPerformanceChartType) {
      case 'radar':
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={performanceData}
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="#667eea" 
                name="Performance"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render different chart types for office classification
  const renderOfficeChart = () => {
    switch (officeChartType) {
      case 'pie':
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={officeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {officeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radial':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="10%" 
              outerRadius="80%" 
              barSize={10} 
              data={officeData.map((entry, index) => ({
                ...entry,
                fill: COLORS[index % COLORS.length]
              }))}
            >
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="value"
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend iconSize={10} width={120} height={140} layout='vertical' verticalAlign='middle' align="right" />
            </RadialBarChart>
          </ResponsiveContainer>
        );
      default:
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render different chart types for category classification
  const renderCategoryChart = () => {
    switch (categoryChartType) {
      case 'bar':
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
        );
      case 'pie':
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
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
        );
    }
  };

  // Render different chart types for service classification
  const renderServiceChart = () => {
    switch (serviceChartType) {
      case 'pie':
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {serviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radial':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="10%" 
              outerRadius="80%" 
              barSize={10} 
              data={serviceData.map((entry, index) => ({
                ...entry,
                fill: COLORS[index % COLORS.length]
              }))}
            >
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="value"
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend iconSize={10} width={120} height={140} layout='vertical' verticalAlign='middle' align="right" />
            </RadialBarChart>
          </ResponsiveContainer>
        );
      default:
        return (
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
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  // Render different chart types for obligation classification
  const renderObligationChart = () => {
    switch (serviceChartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={obligationData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {obligationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={obligationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {obligationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'radial':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              innerRadius="10%" 
              outerRadius="80%" 
              barSize={10} 
              data={obligationData.map((entry, index) => ({
                ...entry,
                fill: COLORS[index % COLORS.length]
              }))}
            >
              <RadialBar
                minAngle={15}
                label={{ position: 'insideStart', fill: '#fff' }}
                background
                dataKey="value"
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend iconSize={10} width={120} height={140} layout='vertical' verticalAlign='middle' align="right" />
            </RadialBarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={obligationData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {obligationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #ccc',
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  // Helper function to convert dashboard data to CSV
  const convertToCSV = (data) => {
    let csv = 'D-Nothi Team & Activity Management Dashboard Report\n';
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `Generated by: ${data.user}\n`;
    csv += `Report Type: ${data.reportType}\n\n`;
    
    // Tasks section
    if (data.tasks && data.tasks.length > 0) {
      csv += 'TASKS\n';
      csv += 'Date,Source,Category,Service,Obligation,User,Office,Status\n';
      
      data.tasks.forEach((task, index) => {
        const taskData = task.toJSON ? task.toJSON() : task;
        csv += `"${taskData.date || 'N/A'}","${taskData.source || 'N/A'}","${taskData.category || 'N/A'}","${taskData.service || 'N/A'}","${taskData.obligation || 'N/A'}","${taskData.userName || 'N/A'}","${taskData.office || 'N/A'}","${taskData.status || 'N/A'}"\n`;
      });
      csv += '\n';
    }
    
    // Leaves section
    if (data.leaves && data.leaves.length > 0) {
      csv += 'LEAVES\n';
      csv += 'Employee,Start Date,End Date,Reason,Status,Approved By\n';
      
      data.leaves.forEach((leave, index) => {
        const leaveData = leave.toJSON ? leave.toJSON() : leave;
        csv += `"${leaveData.userName || 'N/A'}","${leaveData.startDate || 'N/A'}","${leaveData.endDate || 'N/A'}","${leaveData.reason || 'N/A'}","${leaveData.status || 'N/A'}","${leaveData.approvedByName || 'N/A'}"\n`;
      });
    }
    
    return csv;
  };

  // Helper function to convert dashboard data to PDF-like text with better formatting
  const convertToPDF = (data) => {
    let pdf = 'D-Nothi Team & Activity Management Dashboard Report\n';
    pdf += '='.repeat(80) + '\n';
    pdf += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    pdf += `Generated by: ${data.user}\n`;
    pdf += `Report Type: ${data.reportType}\n`;
    pdf += '='.repeat(80) + '\n\n';
    
    // Tasks section
    if (data.tasks && data.tasks.length > 0) {
      pdf += 'TASKS\n';
      pdf += '='.repeat(80) + '\n\n';
      
      // Create a table-like format for tasks
      pdf += '+------------+------------+------------+------------+------------+------------+------------+------------+\n';
      pdf += '| Date       | Source     | Category   | Service    | Obligation | User       | Office     | Status     |\n';
      pdf += '+------------+------------+------------+------------+------------+------------+------------+------------+\n';
      
      data.tasks.forEach((task, index) => {
        const taskData = task.toJSON ? task.toJSON() : task;
        const date = taskData.date || 'N/A';
        const source = taskData.source || 'N/A';
        const category = taskData.category || 'N/A';
        const service = taskData.service || 'N/A';
        const obligation = taskData.obligation || 'N/A';
        const userName = taskData.userName || 'N/A';
        const office = taskData.office || 'N/A';
        const status = taskData.status || 'N/A';
        
        // Truncate values to fit in columns
        const formatDate = date.length > 10 ? date.substring(0, 10) : date;
        const formatSource = source.length > 10 ? source.substring(0, 10) : source;
        const formatCategory = category.length > 10 ? category.substring(0, 10) : category;
        const formatService = service.length > 10 ? service.substring(0, 10) : service;
        const formatObligation = obligation.length > 10 ? obligation.substring(0, 10) : obligation;
        const formatUser = userName.length > 10 ? userName.substring(0, 10) : userName;
        const formatOffice = office.length > 10 ? office.substring(0, 10) : office;
        const formatStatus = status.length > 10 ? status.substring(0, 10) : status;
        
        pdf += `| ${formatDate.padEnd(10)} | ${formatSource.padEnd(10)} | ${formatCategory.padEnd(10)} | ${formatService.padEnd(10)} | ${formatObligation.padEnd(10)} | ${formatUser.padEnd(10)} | ${formatOffice.padEnd(10)} | ${formatStatus.padEnd(10)} |\n`;
      });
      
      pdf += '+------------+------------+------------+------------+------------+------------+------------+------------+\n\n';
    }
    
    // Leaves section
    if (data.leaves && data.leaves.length > 0) {
      pdf += 'LEAVES\n';
      pdf += '='.repeat(80) + '\n\n';
      
      // Create a table-like format for leaves
      pdf += '+------------+------------+------------+------------+------------+------------+\n';
      pdf += '| Employee   | Start Date | End Date   | Reason     | Status     | Approved By|\n';
      pdf += '+------------+------------+------------+------------+------------+------------+\n';
      
      data.leaves.forEach((leave, index) => {
        const leaveData = leave.toJSON ? leave.toJSON() : leave;
        const userName = leaveData.userName || 'N/A';
        const startDate = leaveData.startDate || 'N/A';
        const endDate = leaveData.endDate || 'N/A';
        const reason = leaveData.reason || 'N/A';
        const status = leaveData.status || 'N/A';
        const approvedBy = leaveData.approvedByName || 'N/A';
        
        // Truncate values to fit in columns
        const formatUser = userName.length > 10 ? userName.substring(0, 10) : userName;
        const formatStart = startDate.length > 10 ? startDate.substring(0, 10) : startDate;
        const formatEnd = endDate.length > 10 ? endDate.substring(0, 10) : endDate;
        const formatReason = reason.length > 10 ? reason.substring(0, 10) : reason;
        const formatStatus = status.length > 10 ? status.substring(0, 10) : status;
        const formatApproved = approvedBy.length > 10 ? approvedBy.substring(0, 10) : approvedBy;
        
        pdf += `| ${formatUser.padEnd(10)} | ${formatStart.padEnd(10)} | ${formatEnd.padEnd(10)} | ${formatReason.padEnd(10)} | ${formatStatus.padEnd(10)} | ${formatApproved.padEnd(10)} |\n`;
      });
      
      pdf += '+------------+------------+------------+------------+------------+------------+\n';
    }
    
    // Add footer
    pdf += '\n' + '='.repeat(80) + '\n';
    pdf += 'Report generated by D-Nothi Team & Activity Management System\n';
    pdf += new Date().toLocaleString() + '\n';
    
    return pdf;
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
    <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
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
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newViewMode) => newViewMode && setViewMode(newViewMode)}
              aria-label="view mode"
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }
                }
              }}
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
                  <TextField {...params} label="Select User" size="small" variant="outlined" />
                )}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            height: '100%',
            background: 'linear-gradient(135deg, #667eea20 0%, #667eea10 100%)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            borderRadius: 2,
            boxShadow: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: 2,
            boxShadow: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Pending Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 2,
            boxShadow: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Completed Tasks
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            border: '1px solid rgba(240, 147, 251, 0.2)',
            borderRadius: 2,
            boxShadow: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Pending Leaves
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
            border: '1px solid rgba(118, 75, 162, 0.2)',
            borderRadius: 2,
            boxShadow: 3,
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: 6
            }
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Approved Leaves
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
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
      <Paper sx={{ p: { xs: 1.5, md: 2 }, mb: { xs: 2, md: 3 }, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <FilterIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Box>
        
        <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Time Range</InputLabel>
              <Select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
                variant="outlined"
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
              variant="outlined"
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
              variant="outlined"
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
                  flex: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  },
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Apply
              </Button>
              <Button 
                startIcon={<ClearIcon />} 
                onClick={handleClearFilters}
                variant="outlined"
                size="small"
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    backgroundColor: 'primary.light',
                    color: 'primary.dark'
                  }
                }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={() => handleExport('CSV')}
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'success.main',
                  color: 'success.main',
                  '&:hover': {
                    borderColor: 'success.dark',
                    backgroundColor: 'success.light',
                    color: 'success.dark'
                  }
                }}
              >
                Export CSV
              </Button>
              <Button 
                startIcon={<DownloadIcon />} 
                onClick={() => handleExport('PDF')}
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    borderColor: 'error.dark',
                    backgroundColor: 'error.light',
                    color: 'error.dark'
                  }
                }}
              >
                Export PDF
              </Button>
              <Button 
                startIcon={<RefreshIcon />} 
                onClick={fetchDashboardData}
                variant="outlined"
                size="small"
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'info.main',
                  color: 'info.main',
                  '&:hover': {
                    borderColor: 'info.dark',
                    backgroundColor: 'info.light',
                    color: 'info.dark'
                  }
                }}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts Section - Improved Layout and Sizes */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 4 } }}>
        {/* Task Trend Chart - Full Width */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Task Trends
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Bar Chart">
                  <IconButton 
                    color={chartType === 'bar' ? 'primary' : 'default'}
                    onClick={() => setChartType('bar')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: chartType === 'bar' ? '2px solid' : '1px solid',
                      borderColor: chartType === 'bar' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <BarChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Line Chart">
                  <IconButton 
                    color={chartType === 'line' ? 'primary' : 'default'}
                    onClick={() => setChartType('line')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: chartType === 'line' ? '2px solid' : '1px solid',
                      borderColor: chartType === 'line' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <LineChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Area Chart">
                  <IconButton 
                    color={chartType === 'area' ? 'primary' : 'default'}
                    onClick={() => setChartType('area')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: chartType === 'area' ? '2px solid' : '1px solid',
                      borderColor: chartType === 'area' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <ShowChartIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: { xs: 350, sm: 400, md: 450 } }}>
              {renderTaskTrendChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Task Performance Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Task Performance
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Radar Chart">
                  <IconButton 
                    color={taskPerformanceChartType === 'radar' ? 'primary' : 'default'}
                    onClick={() => setTaskPerformanceChartType('radar')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: taskPerformanceChartType === 'radar' ? '2px solid' : '1px solid',
                      borderColor: taskPerformanceChartType === 'radar' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <RadarIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bar Chart">
                  <IconButton 
                    color={taskPerformanceChartType === 'bar' ? 'primary' : 'default'}
                    onClick={() => setTaskPerformanceChartType('bar')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: taskPerformanceChartType === 'bar' ? '2px solid' : '1px solid',
                      borderColor: taskPerformanceChartType === 'bar' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <BarChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={taskPerformanceChartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setTaskPerformanceChartType('pie')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: taskPerformanceChartType === 'pie' ? '2px solid' : '1px solid',
                      borderColor: taskPerformanceChartType === 'pie' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: { xs: 350, sm: 400, md: 450 } }}>
              {renderTaskPerformanceChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Office Classification Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Office Classification
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={officeChartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setOfficeChartType('pie')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: officeChartType === 'pie' ? '2px solid' : '1px solid',
                      borderColor: officeChartType === 'pie' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Donut Chart">
                  <IconButton 
                    color={officeChartType === 'donut' ? 'primary' : 'default'}
                    onClick={() => setOfficeChartType('donut')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: officeChartType === 'donut' ? '2px solid' : '1px solid',
                      borderColor: officeChartType === 'donut' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <DonutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Radial Chart">
                  <IconButton 
                    color={officeChartType === 'radial' ? 'primary' : 'default'}
                    onClick={() => setOfficeChartType('radial')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: officeChartType === 'radial' ? '2px solid' : '1px solid',
                      borderColor: officeChartType === 'radial' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <RadarIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: { xs: 350, sm: 400, md: 450 } }}>
              {renderOfficeChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Category Classification Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Category Classification
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Bar Chart">
                  <IconButton 
                    color={categoryChartType === 'bar' ? 'primary' : 'default'}
                    onClick={() => setCategoryChartType('bar')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: categoryChartType === 'bar' ? '2px solid' : '1px solid',
                      borderColor: categoryChartType === 'bar' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <BarChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={categoryChartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setCategoryChartType('pie')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: categoryChartType === 'pie' ? '2px solid' : '1px solid',
                      borderColor: categoryChartType === 'pie' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Donut Chart">
                  <IconButton 
                    color={categoryChartType === 'donut' ? 'primary' : 'default'}
                    onClick={() => setCategoryChartType('donut')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: categoryChartType === 'donut' ? '2px solid' : '1px solid',
                      borderColor: categoryChartType === 'donut' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <DonutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: { xs: 350, sm: 400, md: 450 } }}>
              {renderCategoryChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Service Classification Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Service Classification
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={serviceChartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setServiceChartType('pie')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: serviceChartType === 'pie' ? '2px solid' : '1px solid',
                      borderColor: serviceChartType === 'pie' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Donut Chart">
                  <IconButton 
                    color={serviceChartType === 'donut' ? 'primary' : 'default'}
                    onClick={() => setServiceChartType('donut')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: serviceChartType === 'donut' ? '2px solid' : '1px solid',
                      borderColor: serviceChartType === 'donut' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <DonutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Radial Chart">
                  <IconButton 
                    color={serviceChartType === 'radial' ? 'primary' : 'default'}
                    onClick={() => setServiceChartType('radial')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: serviceChartType === 'radial' ? '2px solid' : '1px solid',
                      borderColor: serviceChartType === 'radial' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <RadarIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: { xs: 350, sm: 400, md: 450 } }}>
              {renderServiceChart()}
            </Box>
          </Paper>
        </Grid>
        
        {/* Obligation Classification Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, height: '100%', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <BuildIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Obligation Classification
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Pie Chart">
                  <IconButton 
                    color={serviceChartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setServiceChartType('pie')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: serviceChartType === 'pie' ? '2px solid' : '1px solid',
                      borderColor: serviceChartType === 'pie' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <PieChartIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Donut Chart">
                  <IconButton 
                    color={serviceChartType === 'donut' ? 'primary' : 'default'}
                    onClick={() => setServiceChartType('donut')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: serviceChartType === 'donut' ? '2px solid' : '1px solid',
                      borderColor: serviceChartType === 'donut' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <DonutIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Radial Chart">
                  <IconButton 
                    color={serviceChartType === 'radial' ? 'primary' : 'default'}
                    onClick={() => setServiceChartType('radial')}
                    size="small"
                    sx={{ 
                      borderRadius: 2,
                      border: serviceChartType === 'radial' ? '2px solid' : '1px solid',
                      borderColor: serviceChartType === 'radial' ? 'primary.main' : 'divider',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <RadarIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Box sx={{ height: { xs: 350, sm: 400, md: 450 } }}>
              {renderObligationChart()}
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