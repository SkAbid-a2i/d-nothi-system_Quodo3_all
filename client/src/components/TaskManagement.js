import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Autocomplete,
  Alert,
  CircularProgress,
  Snackbar,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { dropdownAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]); // Store all tasks for filtering
  const [dataLoading, setDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [offices, setOffices] = useState([]); // Add offices state
  const [selectedOffice, setSelectedOffice] = useState(null); // Add selected office state
  const [users, setUsers] = useState([]); // Add users state for filtering
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user state
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [files, setFiles] = useState([]); // File upload state
  // Removed assignedTo state as requested
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSelectedSource, setEditSelectedSource] = useState(null);
  const [editSelectedCategory, setEditSelectedCategory] = useState(null);
  const [editSelectedService, setEditSelectedService] = useState(null);
  const [editSelectedOffice, setEditSelectedOffice] = useState(null); // Add edit selected office state
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editFiles, setEditFiles] = useState([]); // Edit file upload state
  // Removed editAssignedTo state as requested
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState(''); // Add user filter

  // Filter services when category changes (for create form)
  useEffect(() => {
    if (selectedCategory) {
      fetchServicesForCategory(selectedCategory.value);
    } else {
      setServices([]);
      setSelectedService(null);
    }
  }, [selectedCategory]);

  // Filter services when category changes (for edit form)
  useEffect(() => {
    if (editSelectedCategory) {
      fetchServicesForCategory(editSelectedCategory.value, true);
    } else {
      setServices([]);
      setEditSelectedService(null);
    }
  }, [editSelectedCategory]);

  const fetchTasks = useCallback(async () => {
    setDataLoading(true);
    try {
      console.log('Fetching tasks...');
      const response = await taskAPI.getAllTasks();
      console.log('Tasks response:', response);
      
      // Filter tasks based on user role
      let tasksData = Array.isArray(response.data) ? response.data : 
                       response.data?.data || response.data || [];
      
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
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to fetch tasks';
      setError(`Failed to fetch tasks: ${errorMessage}`);
      showSnackbar(`Failed to fetch tasks: ${errorMessage}`, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [user]); // Add user to dependencies

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchDropdownValues();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('TaskManagement', 'tasks', fetchTasks, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('TaskManagement');
    };
  }, [fetchTasks]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      showSnackbar(`New task created: ${data.task.description}`, 'info');
      fetchTasks(); // Refresh data
    };

    const handleTaskUpdated = (data) => {
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
      fetchTasks(); // Refresh data
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);

    // Cleanup on unmount
    return () => {
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
    };
  }, [fetchTasks]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch dropdown values on component mount
  const fetchDropdownValues = async () => {
    setLoading(true);
    try {
      const [sourcesRes, categoriesRes, officesRes, usersRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Office'), // Add office dropdown values
        taskAPI.getAllUsers() // Fetch users for filtering
      ]);
    
      setSources(sourcesRes.data);
      setCategories(categoriesRes.data);
      setOffices(officesRes.data); // Set offices data
      
      // Process users data for Autocomplete
      if (usersRes.data) {
        const userData = usersRes.data.map(user => ({
          id: user.id,
          label: `${user.fullName || user.username} (${user.username})`,
          value: user.username
        }));
        setUsers(userData);
      }
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServicesForCategory = async (categoryValue, isEdit = false) => {
    try {
      const response = await dropdownAPI.getDropdownValues('Service', categoryValue);
      if (isEdit) {
        setEditSelectedService(response.data);
      } else {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Log audit entry
      // Removed auditLog call that was causing issues
      
      setSuccess('Task deleted successfully!');
      showSnackbar('Task deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete task';
      setError(`Failed to delete task: ${errorMessage}`);
      showSnackbar(`Failed to delete task: ${errorMessage}`, 'error');
    }
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };
  
  // Handle edit file selection
  const handleEditFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setEditFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };
  
  // Remove file from create form
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  // Remove file from edit form
  const removeEditFile = (index) => {
    setEditFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!date || !description) {
      setError('Date and description are required');
      showSnackbar('Date and description are required', 'error');
      return;
    }
    
    try {
      // Prepare task data
      const taskData = {
        date,
        source: selectedSource?.value || '',
        category: selectedCategory?.value || '',
        service: selectedService?.value || '',
        office: selectedOffice?.value || user?.office || '', // Use selected office or user's office
        description,
        status,
        // Removed assignedTo from taskData
        userId: user?.id, // Automatically add user ID
        userName: user?.fullName || user?.username // Automatically add user name
      };
    
      console.log('Creating task with data:', taskData);
    
      // For now, we'll store file names in the files array
      // In a real implementation, you would upload files to a storage service
      const fileData = files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }));
    
      taskData.files = fileData;
    
      const response = await taskAPI.createTask(taskData);
    
      console.log('Task creation response:', response);
    
      // Add new task to list
      const newTask = {
        id: response.data.id,
        ...taskData,
        userId: user?.id,
        userName: user?.fullName || user?.username
      };
      setTasks([...tasks, newTask]);
    
      // Log audit entry
      // Removed auditLog call that was causing issues
    
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedSource(null);
      setSelectedCategory(null);
      setSelectedService(null);
      setSelectedOffice(null); // Reset selected office
      setDescription('');
      setStatus('Pending');
      setFiles([]); // Reset files
      // Removed assignedTo reset
      
      setOpenCreateDialog(false);
      setSuccess('Task created successfully!');
      showSnackbar('Task created successfully!', 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to create task';
      setError(`Failed to create task: ${errorMessage}`);
      showSnackbar(`Failed to create task: ${errorMessage}`, 'error');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditDate(task.date || '');
    setEditSelectedSource(sources.find(s => s.value === task.source) || null);
    setEditSelectedCategory(categories.find(c => c.value === task.category) || null);
    setEditSelectedService(services.find(s => s.value === task.service) || null);
    setEditSelectedOffice(offices.find(o => o.value === task.office) || null); // Set edit selected office
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'Pending');
    setEditFiles(task.files || []); // Set existing files
    // Removed editAssignedTo assignment
    setOpenEditDialog(true);
  };

  const handleUpdateTask = async () => {
    try {
      const taskData = {
        date: editDate,
        source: editSelectedSource?.value || '',
        category: editSelectedCategory?.value || '',
        service: editSelectedService?.value || '',
        office: editSelectedOffice?.value || user?.office || '', // Use selected office or user's office
        description: editDescription,
        status: editStatus,
        // Removed assignedTo from taskData
        userId: user?.id, // Automatically add user ID
        userName: user?.fullName || user?.username // Automatically add user name
      };
    
      // For now, we'll store file names in the files array
      // In a real implementation, you would upload files to a storage service
      const fileData = editFiles.map(file => 
        typeof file === 'string' ? file : {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      );
    
      taskData.files = fileData;
    
      await taskAPI.updateTask(editingTask.id, taskData);
    
      // Update task in list
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...taskData } : task
      ));
    
      // Log audit entry
      // Removed auditLog call that was causing issues
    
      setOpenEditDialog(false);
      setEditingTask(null);
      setSuccess('Task updated successfully!');
      showSnackbar('Task updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task';
      setError(`Failed to update task: ${errorMessage}`);
      showSnackbar(`Failed to update task: ${errorMessage}`, 'error');
    }
  };

  // Filter tasks based on search term, status, and user
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = !searchTerm || 
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.category && task.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.service && task.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.userName && task.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || task.status === statusFilter;
    
    const matchesUser = !userFilter || task.userName === userFilter;
    
    return matchesSearch && matchesStatus && matchesUser;
  });

  // Get task statistics
  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length
    };
    return stats;
  };

  const taskStats = getTaskStats();

  // Handle View Details for task statistics
  const handleViewDetails = (filterType) => {
    // Set the active tab to "All Tasks" (tab 0)
    setActiveTab(0);
    
    // Apply the appropriate filter
    switch (filterType) {
      case 'pending':
        setStatusFilter('Pending');
        break;
      case 'inProgress':
        setStatusFilter('In Progress');
        break;
      case 'completed':
        setStatusFilter('Completed');
        break;
      default:
        // For total tasks, clear filters to show all
        setStatusFilter('');
        setSearchTerm('');
        setUserFilter('');
        break;
    }
    
    // Scroll to the task list
    setTimeout(() => {
      const taskListElement = document.getElementById('task-list');
      if (taskListElement) {
        taskListElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting tasks as ${format}`);
    // In a real implementation, you would generate and download the export file
    showSnackbar(`Exporting tasks as ${format}...`, 'info');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        My Tasks
      </Typography>
      
      {/* Task Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div">
                  {taskStats.total}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('total')}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HourglassEmptyIcon sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h5" component="div">
                  {taskStats.pending}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Pending
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('pending')}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HourglassEmptyIcon sx={{ mr: 2, color: 'info.main' }} />
                <Typography variant="h5" component="div">
                  {taskStats.inProgress}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('inProgress')}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  {taskStats.completed}
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Completed
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => handleViewDetails('completed')}>View Details</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Task Tabs */}
      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              minHeight: 48
            },
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(45deg, #667eea, #764ba2)'
            }
          }}
        >
          <Tab label="All Tasks" icon={<AssignmentIcon />} />
          <Tab label="Create Task" icon={<AddIcon />} />
        </Tabs>
      </Paper>
      
      {/* All Tasks Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Task Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select 
                    label="Status" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(user.role === 'Admin' || user.role === 'Supervisor' || user.role === 'SystemAdmin') && (
                <Grid item xs={12} sm={3}>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option.label || option}
                      value={users.find(u => u.value === userFilter) || null}
                      onChange={(event, newValue) => setUserFilter(newValue ? newValue.value : '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Filter by User" fullWidth />
                      )}
                    />
                  )}
                </Grid>
              )}
              <Grid item xs={12} sm={3}>
                <Button 
                  variant="outlined" 
                  startIcon={<FilterIcon />}
                  sx={{ mr: 1 }}
                >
                  Apply Filters
                </Button>
                <Button 
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setUserFilter('');
                  }}
                >
                  Clear
                </Button>
                <Button 
                  startIcon={<DownloadIcon />} 
                  onClick={() => handleExport('CSV')}
                  sx={{ ml: 1, mr: 1 }}
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
              </Grid>
            </Grid>
          </Paper>
          
          {/* Task List */}
          {dataLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} id="task-list">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Service</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Files</TableCell>
                    {/* Removed Assigned To column */}
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
                      <TableCell>{task.description || 'N/A'}</TableCell>
                      <TableCell>{task.userName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status || 'Pending'} 
                          color={
                            task.status === 'Completed' ? 'success' : 
                            task.status === 'In Progress' ? 'primary' : 
                            task.status === 'Pending' ? 'warning' : 'default'
                          } 
                        />
                      </TableCell>
                      <TableCell>
                        {task.files && task.files.length > 0 ? (
                          <Tooltip title={`${task.files.length} file(s)`}>
                            <Chip 
                              icon={<DescriptionIcon />} 
                              label={task.files.length} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </Tooltip>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      {/* Removed Assigned To cell */}
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditTask(task)}
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
          )}
        </Box>
      )}
      
      {/* Create Task Tab */}
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create New Task
          </Typography>
          <Grid container spacing={2} component="form" onSubmit={handleSubmitTask}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={sources}
                  getOptionLabel={(option) => option.value}
                  value={selectedSource}
                  onChange={(event, newValue) => setSelectedSource(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Source" fullWidth />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.value}
                  value={selectedCategory}
                  onChange={(event, newValue) => setSelectedCategory(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Category" fullWidth />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={services}
                  getOptionLabel={(option) => option.value}
                  value={selectedService}
                  onChange={(event, newValue) => setSelectedService(newValue)}
                  disabled={!selectedCategory}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Service" 
                      fullWidth 
                      disabled={!selectedCategory}
                    />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={offices}
                  getOptionLabel={(option) => option.value}
                  value={selectedOffice}
                  onChange={(event, newValue) => setSelectedOffice(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Office" fullWidth />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select 
                  label="Status" 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* File Upload Field */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Upload Files
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  multiple
                />
              </Button>
              
              {/* Display selected files */}
              {files.length > 0 && (
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Files:
                  </Typography>
                  <List dense>
                    {files.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB - ${file.type}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => removeFile(index)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                type="submit"
                sx={{ mr: 2 }}
              >
                Create Task
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setActiveTab(0)}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Create Task Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          {/* Dialog content would go here if needed */}
        </DialogContent>
        <DialogActions>
          {/* Dialog actions would go here if needed */}
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
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={sources}
                  getOptionLabel={(option) => option.value}
                  value={editSelectedSource}
                  onChange={(event, newValue) => setEditSelectedSource(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Source" fullWidth />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.value}
                  value={editSelectedCategory}
                  onChange={(event, newValue) => setEditSelectedCategory(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Category" fullWidth />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={services}
                  getOptionLabel={(option) => option.value}
                  value={editSelectedService}
                  onChange={(event, newValue) => setEditSelectedService(newValue)}
                  disabled={!editSelectedCategory}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Service" 
                      fullWidth 
                      disabled={!editSelectedCategory}
                    />
                  )}
                />
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <Autocomplete
                  options={offices}
                  getOptionLabel={(option) => option.value}
                  value={editSelectedOffice}
                  onChange={(event, newValue) => setEditSelectedOffice(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Office" fullWidth />
                  )}
                />
              )}
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
                  label="Status" 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* File Upload Field for Edit */}
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                fullWidth
              >
                Add More Files
                <input
                  type="file"
                  hidden
                  onChange={handleEditFileChange}
                  multiple
                />
              </Button>
              
              {/* Display existing and selected files */}
              {(editFiles.length > 0 || files.length > 0) && (
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Files:
                  </Typography>
                  <List dense>
                    {editFiles.map((file, index) => (
                      <ListItem key={`edit-${index}`}>
                        <ListItemText
                          primary={typeof file === 'string' ? file : file.name}
                          secondary={typeof file === 'string' ? 'Existing file' : `${(file.size / 1024).toFixed(2)} KB - ${file.type}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            aria-label="delete"
                            onClick={() => removeEditFile(index)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
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
      
      {/* Messages */}
      {dataLoading && (
        <Typography>Loading tasks...</Typography>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
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

export default TaskManagement;