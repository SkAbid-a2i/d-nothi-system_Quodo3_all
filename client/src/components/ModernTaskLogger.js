import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Fade,
  Zoom,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment,
  Flag as FlagIcon
} from '@mui/icons-material';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { dropdownAPI, taskAPI, userAPI } from '../services/api';

const ModernTaskLogger = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: '',
    service: '',
    userInformation: '',
    description: '',
    status: 'Pending'
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // All tasks state
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  
  // Edit task dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Dropdown values state
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [statuses] = useState(['Pending', 'In Progress', 'Completed', 'Cancelled']);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Fetch dropdown values on component mount
  useEffect(() => {
    fetchInitialData();
  }, [user?.id, user?.role]);

  const fetchInitialData = async (retryCount = 0) => {
    setLoading(true);
    setDropdownLoading(true);
    try {
      // Fetch all data together for better performance
      const responses = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Service'),
        taskAPI.getAllTasks()
      ]);
      
      // Process responses
      const [sourcesRes, categoriesRes, servicesRes, tasksRes] = responses;
      
      console.log('Sources response:', sourcesRes);
      console.log('Categories response:', categoriesRes);
      console.log('Services response:', servicesRes);
      console.log('Tasks response:', tasksRes);
      
      const sourcesData = Array.isArray(sourcesRes.data) ? sourcesRes.data : 
                         sourcesRes.data?.data || sourcesRes.data || [];
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : 
                            categoriesRes.data?.data || categoriesRes.data || [];
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : 
                          servicesRes.data?.data || servicesRes.data || [];
      const tasksData = Array.isArray(tasksRes.data) ? tasksRes.data : 
                       tasksRes.data?.data || tasksRes.data || [];
      
      console.log('Processed dropdown data:', { sourcesData, categoriesData, servicesData });
      console.log('User role:', user?.role);
      
      setSources(sourcesData);
      setCategories(categoriesData);
      setServices(servicesData);
      
      // Filter tasks based on user role
      let filteredTasksData = tasksData;
      if (user) {
        if (user.role === 'Agent' || user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'SystemAdmin') {
          // All roles (including admin roles) only see their own tasks
          filteredTasksData = tasksData.filter(task => 
            task.userId === user.id || task.userName === user.username
          );
        }
      }
      
      setTasks(filteredTasksData);
      setFilteredTasks(filteredTasksData);
      
    } catch (error) {
      console.error('Error fetching initial data:', error);
      console.error('Error response:', error.response);
      
      // Retry logic for temporary connection issues
      if (retryCount < 3 && (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('network'))) {
        console.log(`Retrying fetchInitialData (attempt ${retryCount + 1}/3)...`);
        setTimeout(() => {
          fetchInitialData(retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
        return; // Don't set loading states yet
      }
      
      showSnackbar('Unable to load data. Please check your connection and try again.', 'error');
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
      setDropdownLoading(false);
    }
  };

  const fetchDropdownValues = async () => {
    setDropdownLoading(true);
    try {
      // Fetch all dropdown types
      console.log('Fetching dropdown values...');
      const [sourcesRes, categoriesRes, servicesRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Service')
      ]);

      console.log('Sources response:', sourcesRes);
      console.log('Categories response:', categoriesRes);
      console.log('Services response:', servicesRes);

      const sourcesData = Array.isArray(sourcesRes.data) ? sourcesRes.data : 
                         sourcesRes.data?.data || sourcesRes.data || [];
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : 
                            categoriesRes.data?.data || categoriesRes.data || [];
      const servicesData = Array.isArray(servicesRes.data) ? servicesRes.data : 
                          servicesRes.data?.data || servicesRes.data || [];

      console.log('Processed dropdown data:', { sourcesData, categoriesData, servicesData });

      setSources(sourcesData);
      setCategories(categoriesData);
      setServices(servicesData);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error fetching dropdown values: ' + error.message, 'error');
    } finally {
      setDropdownLoading(false);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getAllTasks();
      console.log('Tasks response:', response);
      const tasksData = Array.isArray(response.data) ? response.data : 
                       response.data?.data || response.data || [];
      
      // Filter tasks based on user role - all roles only see their own tasks
      let filteredTasksData = tasksData;
      if (user) {
        // All roles (including admin roles) only see their own tasks
        filteredTasksData = tasksData.filter(task => 
          task.userId === user.id || task.userName === user.username
        );
      }
      
      setTasks(filteredTasksData);
      setFilteredTasks(filteredTasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error fetching tasks: ' + error.message, 'error');
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    console.log('Filtering tasks - user:', user, 'tasks length:', tasks.length);
    // Filter tasks based on search and status
    let filtered = [...tasks]; // Create a copy to avoid mutating original array
    
    if (searchTerm) {
      filtered = filtered.filter(task => 
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    console.log('Filtered tasks length:', filtered.length);
    setFilteredTasks(filtered);
  }, [searchTerm, statusFilter, tasks]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.date || !formData.source || !formData.category || !formData.description) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      // Include userInformation in the task creation
      const taskData = {
        ...formData,
        userId: user?.id, // Automatically add user ID
        userName: user?.fullName || user?.username // Automatically add user name
      };
      const response = await taskAPI.createTask(taskData);
      console.log('Create task response:', response);
      const newTask = Array.isArray(response.data) ? response.data[0] : 
                     response.data?.data || response.data || {};
      
      // Add new task to list with proper user info
      const taskWithUserInfo = {
        ...newTask,
        userId: user?.id,
        userName: user?.fullName || user?.username
      };
      
      setTasks([taskWithUserInfo, ...tasks]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        source: '',
        category: '',
        service: '',
        userInformation: '',
        description: '',
        status: 'Pending'
      });
      
      showSnackbar('Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error creating task: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      date: task.date,
      source: task.source,
      category: task.category,
      service: task.service,
      userInformation: task.userInformation || '',
      description: task.description,
      status: task.status
    });
    setOpenEditDialog(true);
  };

  const handleUpdateTask = async () => {
    try {
      setLoading(true);
      
      // Include userInformation in the task update
      const taskData = {
        ...formData
      };
      const response = await taskAPI.updateTask(editingTask.id, taskData);
      console.log('Update task response:', response);
      const updatedTask = Array.isArray(response.data) ? response.data[0] : 
                         response.data?.data || response.data || {};
      
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...updatedTask } : task
      );
      
      setTasks(updatedTasks);
      setOpenEditDialog(false);
      setEditingTask(null);
      showSnackbar('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error updating task: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setLoading(true);
      await taskAPI.deleteTask(taskId);
      
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      showSnackbar('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error deleting task: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      
      // Update task status
      const response = await taskAPI.updateTask(taskId, { status: newStatus });
      console.log('Update task status response:', response);
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      showSnackbar('Task status updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task status:', error);
      console.error('Error response:', error.response);
      showSnackbar('Error updating task status: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Fade in={true} timeout={500}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3,
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                Task Logger
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Log and track your daily tasks efficiently
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => setActiveTab(1)}
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Create Task
              </Button>
            </Box>
          </Box>
        </Grid>
        
        {/* Create Task Form */}
        <Grid item xs={12}>
          <Zoom in={activeTab === 1}>
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                display: activeTab === 1 ? 'block' : 'none'
              }}
            >
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Create New Task
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Source</InputLabel>
                      <Select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        label="Source"
                        disabled={dropdownLoading}
                      >
                        {sources.map(source => (
                          <MenuItem key={source.id || source.value} value={source.value}>{source.value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        label="Category"
                        disabled={dropdownLoading}
                      >
                        {categories.map(category => (
                          <MenuItem key={category.id || category.value} value={category.value}>{category.value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Service</InputLabel>
                      <Select
                        name="service"
                        value={formData.service}
                        onChange={handleInputChange}
                        label="Service"
                        disabled={dropdownLoading}
                      >
                        {services.map(service => (
                          <MenuItem key={service.id || service.value} value={service.value}>{service.value}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="User Information"
                      name="userInformation"
                      value={formData.userInformation}
                      onChange={handleInputChange}
                      multiline
                      rows={2}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={4}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        label="Status"
                      >
                        {statuses.map(status => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || dropdownLoading}
                      startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                      sx={{ 
                        py: 1.5,
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      {loading ? 'Creating...' : 'Create Task'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Zoom>
        </Grid>
        
        {/* Task List and Recent Activity */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Task History */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 3, 
                  flexWrap: 'wrap', 
                  gap: 2
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Task History
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    flexWrap: 'wrap', 
                    alignItems: 'center'
                  }}>
                    <TextField
                      size="small"
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                      }}
                      sx={{ minWidth: 150 }}
                    />
                    
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                      >
                        <MenuItem value="">All</MenuItem>
                        {statuses.map(status => (
                          <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange} 
                  sx={{ mb: 2 }}
                  TabIndicatorProps={{ style: { background: 'linear-gradient(45deg, #667eea, #764ba2)' } }}
                >
                  <Tab label="All Tasks" />
                  <Tab label="Task Modification & Activity" />
                </Tabs>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">Date</TableCell>
                            <TableCell align="center">Source</TableCell>
                            <TableCell align="center">Category</TableCell>
                            <TableCell align="center">Service</TableCell>
                            <TableCell align="center">Description</TableCell>
                            <TableCell align="center">User</TableCell>
                            <TableCell align="center">User Info</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="center">Flag</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredTasks.map((task) => (
                            <TableRow 
                              key={task.id} 
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: 'action.hover',
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease'
                                }
                              }}
                            >
                              <TableCell align="center">{task.date}</TableCell>
                              <TableCell align="center">{task.source}</TableCell>
                              <TableCell align="center">{task.category}</TableCell>
                              <TableCell align="center">{task.service}</TableCell>
                              <TableCell align="center">{task.description}</TableCell>
                              <TableCell align="center">{task.userName}</TableCell>
                              <TableCell align="center">{task.userInformation || 'N/A'}</TableCell>
                              <TableCell align="center">
                                <Chip 
                                  label={task.status} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: task.status === 'Completed' ? '#10b98120' : 
                                            task.status === 'In Progress' ? '#3b82f620' : 
                                            task.status === 'Cancelled' ? '#ef444420' : '#f59e0b20',
                                    color: task.status === 'Completed' ? '#10b981' : 
                                          task.status === 'In Progress' ? '#3b82f6' : 
                                          task.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                                    fontWeight: 600
                                  }} 
                                />
                              </TableCell>
                              <TableCell align="center">
                                <FormControl fullWidth size="small">
                                  <Select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    displayEmpty
                                    sx={{ 
                                      minWidth: 120,
                                      '& .MuiSelect-select': {
                                        py: 0.5,
                                        px: 1
                                      }
                                    }}
                                  >
                                    {statuses.map(status => (
                                      <MenuItem key={status} value={status}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <FlagIcon 
                                            sx={{ 
                                              fontSize: 16, 
                                              mr: 1,
                                              color: status === 'Completed' ? '#10b981' : 
                                                     status === 'In Progress' ? '#3b82f6' : 
                                                     status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                                            }} 
                                          />
                                          {status}
                                        </Box>
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton 
                                  size="small" 
                                  color="primary" 
                                  onClick={() => handleEditTask(task)}
                                  sx={{ mr: 1 }}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  color="error" 
                                  onClick={() => handleDeleteTask(task.id)}
                                >
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
              </Paper>
            </Grid>
            
            {/* Recent Activity */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Recent Activity
                </Typography>
                
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {tasks.slice(0, 5).map((task, index) => (
                    <Box 
                      key={task.id} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: index % 2 === 0 ? 'grey.50' : 'white',
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderLeftColor: task.status === 'Completed' ? 'success.main' : 
                                        task.status === 'In Progress' ? 'primary.main' : 
                                        task.status === 'Cancelled' ? 'error.main' : 'warning.main'
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {task.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.userName} • {task.date}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={task.status} 
                          size="small"
                          sx={{ 
                            bgcolor: task.status === 'Completed' ? '#10b98120' : 
                                    task.status === 'In Progress' ? '#3b82f620' : 
                                    task.status === 'Cancelled' ? '#ef444420' : '#f59e0b20',
                            color: task.status === 'Completed' ? '#10b981' : 
                                  task.status === 'In Progress' ? '#3b82f6' : 
                                  task.status === 'Cancelled' ? '#ef4444' : '#f59e0b'
                          }} 
                        />
                        <Chip 
                          label={task.category} 
                          size="small" 
                          sx={{ ml: 1, bgcolor: 'info.light', color: 'info.contrastText' }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Edit Task Dialog */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EditIcon sx={{ mr: 1 }} />
              Edit Task
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Source</InputLabel>
                  <Select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    label="Source"
                    disabled={dropdownLoading}
                  >
                    {sources.map(source => (
                      <MenuItem key={source.id || source.value} value={source.value}>{source.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                    disabled={dropdownLoading}
                  >
                    {categories.map(category => (
                      <MenuItem key={category.id || category.value} value={category.value}>{category.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Service</InputLabel>
                  <Select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    label="Service"
                    disabled={dropdownLoading}
                  >
                    {services.map(service => (
                      <MenuItem key={service.id || service.value} value={service.value}>{service.value}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="User Information"
                  name="userInformation"
                  value={formData.userInformation}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    {statuses.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)} startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTask} 
              variant="contained" 
              color="primary" 
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Task'}
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
      </Grid>
    </Fade>
  );
};

export default ModernTaskLogger;