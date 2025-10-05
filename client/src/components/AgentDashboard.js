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
  DialogActions
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment, 
  Notifications,
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
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
import { taskAPI, leaveAPI, dropdownAPI } from '../services/api';
import notificationService from '../services/notificationService';

const AgentDashboard = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
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
      
      // Fetch tasks
      console.log('Fetching tasks...');
      const tasksResponse = await taskAPI.getAllTasks();
      console.log('Tasks response:', tasksResponse);
      // Ensure we're setting an array - API might return an object with data property
      const tasksData = Array.isArray(tasksResponse.data) ? tasksResponse.data : 
                       tasksResponse.data?.data || tasksResponse.data || [];
      setTasks(tasksData);
      
      // Fetch leaves
      console.log('Fetching leaves...');
      const leavesResponse = await leaveAPI.getAllLeaves();
      console.log('Leaves response:', leavesResponse);
      // Ensure we're setting an array - API might return an object with data property
      const leavesData = Array.isArray(leavesResponse.data) ? leavesResponse.data : 
                        leavesResponse.data?.data || leavesResponse.data || [];
      setLeaves(leavesData);
      
      console.log('Dashboard data fetched successfully');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error fetching dashboard data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []); // Remove user from dependencies as it's not used in the function

  // Fetch tasks and leaves on component mount
  useEffect(() => {
    console.log('AgentDashboard component mounted, fetching data...');
    fetchDashboardData();
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

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => 
    (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (task.service && task.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (task.userName && task.userName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter leaves based on search term
  const filteredLeaves = leaves.filter(leave => 
    (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <Button size="small">View Details</Button>
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
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  5
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Reports Generated
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
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
              <Button size="small">View Details</Button>
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
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    color={chartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setChartType('pie')}
                  >
                    <PieChartIcon />
                  </IconButton>
                  <IconButton 
                    color={chartType === 'bar' ? 'primary' : 'default'}
                    onClick={() => setChartType('bar')}
                  >
                    <BarChartIcon />
                  </IconButton>
                  <IconButton 
                    color={chartType === 'line' ? 'primary' : 'default'}
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon />
                  </IconButton>
                  
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('CSV')}
                    sx={{ ml: 2 }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('PDF')}
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
            <Typography variant="h6" gutterBottom>
              Task Distribution - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </Typography>
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
          
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Task History" />
              <Tab label="Leave Summary" />
            </Tabs>
            
            {activeTab === 0 && (
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Office</TableCell>
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
            )}
            
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
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
                  {/* Show recent tasks */}
                  {[...tasks, ...leaves]
                    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
                    .slice(0, 10)
                    .map((item, index) => (
                      <Box 
                        key={index} 
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
                          {item.description || item.reason || 'New activity'}
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
                          {item.category && (
                            <Chip 
                              label={item.category} 
                              size="small" 
                              sx={{ ml: 1 }}
                              color="info"
                            />
                          )}
                          {item.service && (
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