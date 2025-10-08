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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Autocomplete
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment, 
  Notifications,
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  DonutLarge as DonutLargeIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  RadialBarChart,
  RadialBar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { taskAPI, leaveAPI, dropdownAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
  const [leaves, setLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]); // Store all leaves for filtering
  const [users, setUsers] = useState([]); // Add users state for filtering
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // View Details dialog state
  const [viewDetailsDialog, setViewDetailsDialog] = useState({ open: false, type: '', data: null });
  
  // Edit task dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editService, setEditService] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  
  // Dropdown options for edit dialog
  const [editSources, setEditSources] = useState([]);
  const [editCategories, setEditCategories] = useState([]);
  const [editServices, setEditServices] = useState([]);
  
  // Service filtering based on category for edit dialog
  const [filteredEditServices, setFilteredEditServices] = useState([]);

  // Fetch tasks and leaves - useCallback to prevent recreation on every render
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch tasks - filter based on user role
      console.log('Fetching tasks for user:', user?.username);
      const tasksResponse = await taskAPI.getAllTasks();
      console.log('Tasks response:', tasksResponse);
      
      // Filter tasks based on user role
      let tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : 
                       tasksResponse.data?.data || tasksResponse.data || [];
      
      // Store all tasks for filtering
      setAllTasks(tasksData);
      
      // Filter tasks based on user role
      if (user) {
        if (user.role === 'Agent') {
          // Agents only see their own tasks
          tasksData = tasksData.filter(task => 
            task.userId === user.id || task.userName === user.username
          );
        } else if (user.role === 'Admin' || user.role === 'Supervisor') {
          // Admins and Supervisors see tasks from their office
          // But they are also agents, so they should see their own tasks AND their team's tasks
          tasksData = tasksData.filter(task => 
            task.office === user.office
          );
        } else if (user.role === 'SystemAdmin') {
          // SystemAdmin sees all tasks (no filtering needed)
          // tasksData remains unchanged
        }
        // Default case - no filtering
      }
      
      setTasks(tasksData);
      
      // Fetch leaves - filter based on user role
      console.log('Fetching leaves for user:', user?.username);
      const leavesResponse = await leaveAPI.getAllLeaves();
      console.log('Leaves response:', leavesResponse);
      
      // Filter leaves based on user role
      let leavesData = Array.isArray(leavesResponse.data) ? leavesResponse.data : 
                        leavesResponse.data?.data || leavesResponse.data || [];
      
      // Store all leaves for filtering
      setAllLeaves(leavesData);
      
      // Filter leaves based on user role
      if (user) {
        if (user.role === 'Agent') {
          // Agents only see their own leaves
          leavesData = leavesData.filter(leave => 
            leave.userId === user.id || leave.userName === user.username
          );
        } else if (user.role === 'Admin' || user.role === 'Supervisor') {
          // Admins and Supervisors see leaves from their office
          // But they are also agents, so they should see their own leaves AND their team's leaves
          leavesData = leavesData.filter(leave => 
            leave.office === user.office
          );
        } else if (user.role === 'SystemAdmin') {
          // SystemAdmin sees all leaves (no filtering needed)
          // leavesData remains unchanged
        }
        // Default case - no filtering
      }
      
      setLeaves(leavesData);
      
      console.log('Dashboard data fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error fetching dashboard data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user]); // Add user to dependencies

  // Fetch tasks and leaves on component mount
  useEffect(() => {
    console.log('AgentDashboard component mounted, fetching data...');
    fetchDashboardData();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('AgentDashboard', 'dashboard', fetchDashboardData, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('AgentDashboard');
    };
  }, [fetchDashboardData]);

  // Filter services when category changes in edit dialog
  useEffect(() => {
    if (editCategory && editServices.length > 0) {
      const filtered = editServices.filter(svc => 
        svc.parentValue === editCategory || !svc.parentValue
      );
      setFilteredEditServices(filtered);
    } else {
      setFilteredEditServices(editServices);
    }
  }, [editCategory, editServices]);

  // Listen for real-time notifications - with proper dependency array
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

  const handleExport = async (format) => {
    try {
      // Show loading state
      showSnackbar(`Exporting as ${format.toUpperCase()}...`, 'info');
      
      // Prepare data for export
      const exportData = {
        tasks: filteredTasks,
        leaves: filteredLeaves,
        generatedAt: new Date().toISOString(),
        user: user?.username || 'Unknown'
      };
      
      // Create export content based on format
      let content, mimeType, filename;
      
      if (format === 'CSV') {
        // Convert to CSV format
        const csvContent = convertToCSV(exportData);
        content = csvContent;
        mimeType = 'text/csv';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (format === 'PDF') {
        // For PDF, we'll create a simple text representation
        const pdfContent = convertToPDF(exportData);
        content = pdfContent;
        mimeType = 'application/pdf';
        filename = `dashboard_export_${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        // Default to JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
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
      
      showSnackbar(`Exported as ${format.toUpperCase()} successfully!`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar(`Failed to export as ${format.toUpperCase()}`, 'error');
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data) => {
    let csv = 'Dashboard Export\n';
    csv += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    csv += `User: ${data.user}\n\n`;
    
    // Tasks section
    csv += 'Tasks:\n';
    csv += 'Date,Source,Category,Service,Description,User,Status\n';
    
    data.tasks.forEach(task => {
      csv += `"${task.date || ''}","${task.source || ''}","${task.category || ''}","${task.service || ''}","${task.description || ''}","${task.userName || ''}","${task.status || ''}"\n`;
    });
    
    csv += '\nLeaves:\n';
    csv += 'Start Date,End Date,Reason,User,Status\n';
    
    data.leaves.forEach(leave => {
      csv += `"${leave.startDate || ''}","${leave.endDate || ''}","${leave.reason || ''}","${leave.userName || ''}","${leave.status || ''}"\n`;
    });
    
    return csv;
  };

  // Helper function to convert data to PDF-like text
  const convertToPDF = (data) => {
    let pdf = 'Dashboard Export Report\n';
    pdf += '='.repeat(50) + '\n';
    pdf += `Generated: ${new Date(data.generatedAt).toLocaleString()}\n`;
    pdf += `User: ${data.user}\n\n`;
    
    // Tasks section
    pdf += 'TASKS\n';
    pdf += '-'.repeat(20) + '\n';
    
    if (data.tasks.length === 0) {
      pdf += 'No tasks found.\n\n';
    } else {
      data.tasks.forEach((task, index) => {
        pdf += `${index + 1}. ${task.description || 'No description'}\n`;
        pdf += `   Date: ${task.date || 'N/A'}\n`;
        pdf += `   Category: ${task.category || 'N/A'}\n`;
        pdf += `   Status: ${task.status || 'N/A'}\n`;
        pdf += `   User: ${task.userName || 'N/A'}\n\n`;
      });
    }
    
    // Leaves section
    pdf += 'LEAVES\n';
    pdf += '-'.repeat(20) + '\n';
    
    if (data.leaves.length === 0) {
      pdf += 'No leaves found.\n\n';
    } else {
      data.leaves.forEach((leave, index) => {
        pdf += `${index + 1}. ${leave.reason || 'No reason'}\n`;
        pdf += `   Dates: ${leave.startDate || 'N/A'} to ${leave.endDate || 'N/A'}\n`;
        pdf += `   Status: ${leave.status || 'N/A'}\n`;
        pdf += `   User: ${leave.userName || 'N/A'}\n\n`;
      });
    }
    
    return pdf;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle View Details button click
  const handleViewDetails = (type, data = null) => {
    setViewDetailsDialog({ open: true, type, data });
  };

  // Close View Details dialog
  const handleCloseViewDetails = () => {
    setViewDetailsDialog({ open: false, type: '', data: null });
  };

  // Filter tasks based on search term and user
  const filteredTasks = tasks.filter(task => 
    (searchTerm === '' || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.service && task.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.userName && task.userName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedUser === null || task.userName === selectedUser.value)
  );

  // Filter leaves based on search term and user
  const filteredLeaves = leaves.filter(leave => 
    (searchTerm === '' || 
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (selectedUser === null || leave.userName === selectedUser.value)
  );

  // Handle task edit
  const handleEditTask = async (task) => {
    // Fetch dropdown values for edit dialog
    try {
      const [sourcesRes, categoriesRes, servicesRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Service')
      ]);
      
      setEditSources(sourcesRes.data || []);
      setEditCategories(categoriesRes.data || []);
      setEditServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown values for edit:', error);
      setEditSources(['Email', 'Phone', 'Walk-in', 'Online Form', 'Other']);
      setEditCategories(['IT Support', 'HR', 'Finance', 'Administration', 'Other']);
      setEditServices(['Software', 'Hardware', 'Leave', 'Recruitment', 'Billing', 'Other']);
    }
    
    // Set editing task data
    setEditingTask(task);
    setEditDate(task.date || '');
    setEditSource(task.source || '');
    setEditCategory(task.category || '');
    setEditService(task.service || '');
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'Pending');
    
    setOpenEditDialog(true);
  };

  // Handle task update
  const handleUpdateTask = async () => {
    try {
      const updatedTaskData = {
        date: editDate,
        source: editSource,
        category: editCategory,
        service: editService,
        description: editDescription,
        status: editStatus
      };
      
      await taskAPI.updateTask(editingTask.id, updatedTaskData);
      
      showSnackbar('Task updated successfully!', 'success');
      setOpenEditDialog(false);
      setEditingTask(null);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Error updating task: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      showSnackbar('Task deleted successfully!', 'success');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Error deleting task: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Get task distribution data for charts
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

  // Fetch reports data from API instead of using mock data
  const fetchReportsData = useCallback(async () => {
    try {
      // In a real app, this would come from the backend
      // For now, we'll create dynamic reports based on actual data
      const reports = [
        { 
          id: 1, 
          name: 'Weekly Task Report', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'Last 7 days',
          taskCount: tasks.length,
          pendingTasks: tasks.filter(t => t.status === 'Pending').length,
          completedTasks: tasks.filter(t => t.status === 'Completed').length
        },
        { 
          id: 2, 
          name: 'Monthly Leave Report', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'Current Month',
          leaveCount: leaves.length,
          approvedLeaves: leaves.filter(l => l.status === 'Approved').length,
          pendingLeaves: leaves.filter(l => l.status === 'Pending').length
        },
        { 
          id: 3, 
          name: 'Performance Summary', 
          generatedAt: new Date().toLocaleString(), 
          filter: 'All Time',
          totalTasks: tasks.length,
          totalLeaves: leaves.length,
          completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0
        }
      ];
      return reports;
    } catch (error) {
      console.error('Error fetching reports data:', error);
      return [];
    }
  }, [tasks, leaves]);

  // Get reports data
  const getReportsData = () => {
    return fetchReportsData();
  };

  // Mock data for reports (in a real app, this would come from the backend)
  const mockReports = [
    { id: 1, name: 'Weekly Task Report', generatedAt: '2023-06-15 14:30:00', filter: 'Last 7 days' },
    { id: 2, name: 'Monthly Leave Report', generatedAt: '2023-06-01 09:15:00', filter: 'June 2023' },
    { id: 3, name: 'Quarterly Performance Report', generatedAt: '2023-04-01 16:45:00', filter: 'Q2 2023' },
    { id: 4, name: 'Annual Summary Report', generatedAt: '2022-12-31 18:00:00', filter: 'Year 2022' },
    { id: 5, name: 'Department-wise Task Distribution', generatedAt: '2023-06-10 11:20:00', filter: 'All departments' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Agent Dashboard
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Task Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div">
                  {tasks.length}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('tasks', tasks)}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventAvailable sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h5" component="div">
                  {leaves.filter(l => l.status === 'Pending').length}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Pending Leaves
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('leaves', leaves.filter(l => l.status === 'Pending'))}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  {5}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Reports Generated
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('reports', mockReports)}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Notifications sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h5" component="div">
                  7
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Notifications
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('notifications')}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Filters and Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
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
                  label="Search Tasks"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon />
                  }}
                />
              </Grid>
              
              {(user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'SystemAdmin') && (
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    options={users}
                    getOptionLabel={(option) => option.label || option}
                    value={selectedUser}
                    onChange={(event, newValue) => setSelectedUser(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Filter by User" fullWidth />
                    )}
                  />
                </Grid>
              )}
              
              <Grid item xs={12} sm={3}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('CSV')}
                    sx={{ ml: 2, mr: 1 }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('PDF')}
                    sx={{ mr: 1 }}
                  >
                    Export PDF
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Charts and Task Table */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: { xs: 1, sm: 0 } }}>
                Task Classification - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
              </Typography>
              <Box>
                <IconButton 
                  color={chartType === 'bar' ? 'primary' : 'default'}
                  onClick={() => setChartType('bar')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'bar' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <BarChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'pie' ? 'primary' : 'default'}
                  onClick={() => setChartType('pie')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'pie' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <PieChartIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'donut' ? 'primary' : 'default'}
                  onClick={() => setChartType('donut')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'donut' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <DonutLargeIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'radial' ? 'primary' : 'default'}
                  onClick={() => setChartType('radial')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'radial' ? 1 : 0, borderColor: 'primary.main' }}
                >
                  <DonutLargeIcon />
                </IconButton>
                <IconButton 
                  color={chartType === 'line' ? 'primary' : 'default'}
                  onClick={() => setChartType('line')}
                  size="small"
                  sx={{ mx: 0.5, border: chartType === 'line' ? 1 : 0, borderColor: 'primary.main' }}
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
              
              {chartType === 'donut' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getTaskDistributionData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
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
              
              {chartType === 'radial' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    innerRadius="10%" 
                    outerRadius="80%" 
                    barSize={10}
                    data={getTaskDistributionData().map((entry, index) => ({
                      ...entry,
                      fill: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'][index % 5]
                    }))}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ fill: '#666', position: 'insideStart' }}
                      background
                      clockWise={true}
                      dataKey="count"
                    />
                    <Tooltip />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Task History" />
              <Tab label="Leave Summary" />
            </Tabs>
            
            {activeTab === 0 && (
              <Box sx={{ mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Office</TableCell>
                        <TableCell>User Info</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{task.source || 'N/A'}</TableCell>
                          <TableCell>{task.category || 'N/A'}</TableCell>
                          <TableCell>{task.service || 'N/A'}</TableCell>
                          <TableCell>{task.userName || 'N/A'}</TableCell>
                          <TableCell>{task.office || 'N/A'}</TableCell>
                          <TableCell>{task.userInformation || 'N/A'}</TableCell>
                          <TableCell>{task.description || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={task.status || 'Pending'} 
                              color={
                                task.status === 'Completed' ? 'success' : 
                                task.status === 'In Progress' ? 'primary' : 
                                task.status === 'Cancelled' ? 'error' : 'default'
                              } 
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary" onClick={() => handleEditTask(task)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ mt: 2, maxHeight: 400, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  Leave History
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{leave.reason || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={leave.status || 'Pending'} 
                              color={
                                leave.status === 'Approved' ? 'success' : 
                                leave.status === 'Pending' ? 'warning' : 'error'
                              } 
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small" color="primary">
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ height: 'calc(100% - 40px)', overflowY: 'auto' }}>
              {tasks.length > 0 || leaves.length > 0 ? (
                <Box>
                  {/* Show recent tasks and leaves for the current user only */}
                  {[...tasks.map(t => ({...t, type: 'task'})), ...leaves.map(l => ({...l, type: 'leave'}))]
                    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                    .slice(0, 10)
                    .map((item, index) => (
                      <Box 
                        key={`${item.type}-${item.id}`} 
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                          borderRadius: 1,
                          borderLeft: '4px solid',
                          borderLeftColor: item.status === 'Completed' ? 'success.main' : 
                                          item.status === 'Approved' ? 'success.main' : 
                                          item.status === 'Rejected' ? 'error.main' : 
                                          item.status === 'In Progress' ? 'primary.main' : 'warning.main'
                        }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          {item.type === 'task' ? (item.description || 'New task') : (item.reason || 'New leave request')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.userName ? `By ${item.userName}` : 'System'} •{' '}
                          {new Date(item.createdAt || item.date).toLocaleString()}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={item.status || 'Pending'} 
                            size="small"
                            color={
                              item.status === 'Completed' || item.status === 'Approved' ? 'success' : 
                              item.status === 'In Progress' ? 'primary' : 
                              item.status === 'Rejected' ? 'error' : 'default'
                            } 
                          />
                          {item.type === 'task' && item.category && (
                            <Chip 
                              label={item.category} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="info"
                            />
                          )}
                          {item.type === 'task' && item.service && (
                            <Chip 
                              label={item.service} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="secondary"
                            />
                          )}
                        </Box>
                      </Box>
                    ))
                  }
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">No recent activity</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsDialog.open} onClose={handleCloseViewDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1 }} />
            {viewDetailsDialog.type === 'tasks' && 'Task Details'}
            {viewDetailsDialog.type === 'leaves' && 'Leave Details'}
            {viewDetailsDialog.type === 'reports' && 'Report Details'}
            {viewDetailsDialog.type === 'notifications' && 'Notification Details'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {viewDetailsDialog.type === 'tasks' && (
            <Box>
              <DialogContentText sx={{ mb: 2 }}>
                Showing all tasks assigned to you.
              </DialogContentText>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetailsDialog.data?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{task.userName || 'N/A'}</TableCell>
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
            </Box>
          )}
          
          {viewDetailsDialog.type === 'leaves' && (
            <Box>
              <DialogContentText sx={{ mb: 2 }}>
                Showing pending leave requests for you.
              </DialogContentText>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>Reason</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetailsDialog.data?.map((leave) => (
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
            </Box>
          )}
          
          {viewDetailsDialog.type === 'reports' && (
            <Box>
              <DialogContentText sx={{ mb: 2 }}>
                Showing all generated reports with their details.
              </DialogContentText>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Generated At</TableCell>
                      <TableCell>Filter Criteria</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {viewDetailsDialog.data?.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.generatedAt}</TableCell>
                        <TableCell>{report.filter}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          
          {viewDetailsDialog.type === 'notifications' && (
            <Box>
              <DialogContentText>
                Showing recent notifications and alerts.
              </DialogContentText>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Task Created:</strong> New task "Fix login issue" created by John Doe (2023-06-15 14:30)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Leave Approved:</strong> Annual leave request approved for Jane Smith (2023-06-15 10:15)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Task Completed:</strong> Task "Update documentation" marked as completed by Mike Johnson (2023-06-14 16:45)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Leave Rejected:</strong> Sick leave request rejected for Sarah Wilson (2023-06-14 09:20)
                </Typography>
                <Typography variant="body2">
                  <strong>Task Updated:</strong> Task "Implement new feature" status changed to In Progress (2023-06-13 11:30)
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDetails}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Source</InputLabel>
                <Select
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  label="Source"
                >
                  {editSources.map((src) => (
                    <MenuItem key={src.id || src.value} value={src.value || src}>
                      {src.value || src}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  label="Category"
                >
                  {editCategories.map((cat) => (
                    <MenuItem key={cat.id || cat.value} value={cat.value || cat}>
                      {cat.value || cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Service</InputLabel>
                <Select
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  label="Service"
                >
                  {filteredEditServices.map((svc) => (
                    <MenuItem key={svc.id || svc.value} value={svc.value || svc}>
                      {svc.value || svc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateTask} variant="contained" color="primary">
            Update Task
          </Button>
        </DialogActions>
      </Dialog>
      
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

export default AgentDashboard;