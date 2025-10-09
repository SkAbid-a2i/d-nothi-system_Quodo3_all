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
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Close as CloseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { dropdownAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';
import useUserFilter from '../hooks/useUserFilter';
import UserFilterDropdown from './UserFilterDropdown';

const TaskManagement = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
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
  const [userInformation, setUserInformation] = useState(''); // Add user information state
  const [selectedUser, setSelectedUser] = useState(null); // Add selected user state
  const [userFilter, setUserFilter] = useState(''); // Add user filter
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [files, setFiles] = useState([]); // File upload state
  // Removed assignedTo state as requested
  // Removed flag state as requested
  
  // Edit task state
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSelectedSource, setEditSelectedSource] = useState(null);
  const [editSelectedCategory, setEditSelectedCategory] = useState(null);
  const [editSelectedService, setEditSelectedService] = useState(null);
  const [editSelectedOffice, setEditSelectedOffice] = useState(null); // Add edit selected office state
  const [editUserInformation, setEditUserInformation] = useState(''); // Add edit user information state
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editFiles, setEditFiles] = useState([]); // Edit file upload state
  // Removed editAssignedTo state as requested
  // Removed editFlag state as requested
  const [openEditDialog, setOpenEditDialog] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Use the new user filter hook
  const { users, loading: userLoading, error: userError, fetchUsers } = useUserFilter(user);

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
      setError('Failed to fetch tasks: ' + errorMessage);
      showSnackbar('Failed to fetch tasks: ' + errorMessage, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [user]); // Add user to dependencies

  // Add function to directly update status in database
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      // Update status directly in database
      const response = await taskAPI.updateTask(taskId, { status: newStatus });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      setAllTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      showSnackbar('Task status updated successfully!', 'success');
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update task status';
      showSnackbar('Failed to update task status: ' + errorMessage, 'error');
      throw error;
    }
  };

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
  }, [fetchTasks, fetchDropdownValues]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      showSnackbar('New task created: ' + data.task.description, 'info');
      fetchTasks(); // Refresh data
    };

    const handleTaskUpdated = (data) => {
      if (data.deleted) {
        showSnackbar('Task deleted: ' + data.description, 'warning');
      } else {
        showSnackbar('Task updated: ' + data.task.description, 'info');
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

    // Additional debug for user role
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User role:', user?.role);
  }, [user]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch dropdown values on component mount
  const fetchDropdownValues = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching dropdown values...');
      // Fetch all dropdown values in parallel
      const fetchPromises = [
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Office')
      ];
      
      const responses = await Promise.all(fetchPromises);
    
      console.log('All responses:', responses);
    
      // Extract responses
      const [sourcesRes, categoriesRes, officesRes] = responses;
    
      console.log('Sources response:', sourcesRes);
      console.log('Categories response:', categoriesRes);
      console.log('Offices response:', officesRes);
    
      setSources(sourcesRes?.data || []);
      setCategories(categoriesRes?.data || []);
      setOffices(officesRes?.data || []);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      console.error('Error response:', error.response);
      showSnackbar('Failed to load dropdown values. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar, setSources, setCategories, setOffices]);

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
      setError('Failed to delete task: ' + errorMessage);
      showSnackbar('Failed to delete task: ' + errorMessage, 'error');
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
        userInformation, // Add user information
        description,
        status,
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
    
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedSource(null);
      setSelectedCategory(null);
      setSelectedService(null);
      setSelectedOffice(null); // Reset selected office
      setUserInformation(''); // Reset user information
      setDescription('');
      setStatus('Pending');
      setFiles([]); // Reset files
      
      setOpenCreateDialog(false);
      setSuccess('Task created successfully!');
      showSnackbar('Task created successfully!', 'success');
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to create task';
      setError('Failed to create task: ' + errorMessage);
      showSnackbar('Failed to create task: ' + errorMessage, 'error');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditDate(task.date || '');
    setEditSelectedSource(sources.find(s => s.value === task.source) || null);
    setEditSelectedCategory(categories.find(c => c.value === task.category) || null);
    setEditSelectedService(services.find(s => s.value === task.service) || null);
    setEditSelectedOffice(offices.find(o => o.value === task.office) || null); // Set edit selected office
    setEditUserInformation(task.userInformation || ''); // Set edit user information
    setEditDescription(task.description || '');
    setEditStatus(task.status || 'Pending');
    setEditFiles(task.files || []); // Set existing files
    // Removed editAssignedTo assignment
    // Removed editFlag assignment
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
        userInformation: editUserInformation, // Add user information
        description: editDescription,
        status: editStatus,
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
    
      const response = await taskAPI.updateTask(editingTask.id, taskData);
    
      // Update task in list
      setTasks(tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...response.data } : task
      ));
    
      setOpenEditDialog(false);
      setEditingTask(null);
      setSuccess('Task updated successfully!');
      showSnackbar('Task updated successfully!', 'success');
      fetchTasks(); // Refresh task list
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors?.join(', ') || error.message || 'Failed to update task';
      setError('Failed to update task: ' + errorMessage);
      showSnackbar('Failed to update task: ' + errorMessage, 'error');
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
        setSelectedUser(null);
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

  const handleExport = async (format) => {
    try {
      // Show loading state
      showSnackbar('Exporting as ' + format.toUpperCase() + '...', 'info');
      
      // Prepare data for export
      const exportData = {
        tasks: filteredTasks,
        generatedAt: new Date().toISOString(),
        user: user?.username || 'Unknown'
      };
      
      // Create export content based on format
      let content, mimeType, filename;
      
      if (format === 'CSV') {
        // Convert to CSV format
        const csvContent = convertTasksToCSV(exportData);
        content = csvContent;
        mimeType = 'text/csv';
        filename = 'tasks_export_' + new Date().toISOString().split('T')[0] + '.csv';
      } else if (format === 'PDF') {
        // For PDF, we'll create a simple text representation
        const pdfContent = convertTasksToPDF(exportData);
        content = pdfContent;
        mimeType = 'application/pdf';
        filename = 'tasks_export_' + new Date().toISOString().split('T')[0] + '.pdf';
      } else {
        // Default to JSON
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        filename = 'tasks_export_' + new Date().toISOString().split('T')[0] + '.json';
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
      
      showSnackbar('Exported as ' + format.toUpperCase() + ' successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showSnackbar('Failed to export as ' + format.toUpperCase(), 'error');
    }
  };

  // Helper function to convert tasks to CSV
  const convertTasksToCSV = (data) => {
    let csv = 'Tasks Export\n';
    csv += 'Generated: ' + new Date(data.generatedAt).toLocaleString() + '\n';
    csv += 'User: ' + data.user + '\n\n';
    
    // Tasks section
    csv += 'Date,Source,Category,Service,User Info,Description,User,Status,Files\n';
    
    data.tasks.forEach(task => {
      const filesCount = task.files ? task.files.length : 0;
      csv += '"' + (task.date || '') + '","' + (task.source || '') + '","' + (task.category || '') + '","' + (task.service || '') + '","' + (task.userInformation || '') + '","' + (task.description || '') + '","' + (task.userName || '') + '","' + (task.status || '') + '","' + filesCount + '"\n';
    });
    
    return csv;
  };

  // Helper function to convert tasks to PDF-like text
  const convertTasksToPDF = (data) => {
    let pdf = 'Tasks Export Report\n';
    pdf += '==================================================\n';
    pdf += 'Generated: ' + new Date(data.generatedAt).toLocaleString() + '\n';
    pdf += 'User: ' + data.user + '\n\n';
    
    // Tasks section
    if (data.tasks.length === 0) {
      pdf += 'No tasks found.\n\n';
    } else {
      data.tasks.forEach((task, index) => {
        pdf += (index + 1) + '. ' + (task.description || 'No description') + '\n';
        pdf += '   Date: ' + (task.date || 'N/A') + '\n';
        pdf += '   Category: ' + (task.category || 'N/A') + '\n';
        pdf += '   Service: ' + (task.service || 'N/A') + '\n';
        pdf += '   User Info: ' + (task.userInformation || 'N/A') + '\n';
        pdf += '   Status: ' + (task.status || 'N/A') + '\n';
        pdf += '   User: ' + (task.userName || 'N/A') + '\n';
        pdf += '   Files: ' + (task.files ? task.files.length : 0) + '\n\n';
      });
    }
    
    return pdf;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Task Modification & Activity
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
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} sm={6} md={4}>
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
              <Grid item xs={12} sm={6} md={3}>
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
              
              {/* User Filter Dropdown - Only show for Admin roles */}
              {(user && (user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor')) && (
                <UserFilterDropdown
                  users={users}
                  selectedUser={selectedUser}
                  onUserChange={(newValue) => {
                    setSelectedUser(newValue);
                    // Apply filter immediately when user selects a user
                    if (newValue) {
                      setUserFilter(newValue.username || newValue.email || '');
                    } else {
                      setUserFilter('');
                    }
                  }}
                  label="Filter by User"
                  loading={userLoading}
                  gridSize={{ xs: 12, sm: 6, md: 4 }}
                />
              )}

              <Grid item xs={12} sm={12} md={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<FilterIcon />}
                    onClick={() => {
                      // Apply filters
                      if (selectedUser) {
                        setUserFilter(selectedUser.username || selectedUser.email);
                      }
                    }}
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setUserFilter('');
                      setSelectedUser(null);
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('CSV')}
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
                    <TableCell>User Info</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Files</TableCell>
                    {/* Removed Flag column */}
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
                      <TableCell>{task.userInformation || 'N/A'}</TableCell>
                      <TableCell> {/* Make status editable */}
                        <FormControl fullWidth size="small">
                          <Select
                            value={task.status || 'Pending'}
                            onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          >
                            <MenuItem value="Pending">Pending</MenuItem>
                            <MenuItem value="In Progress">In Progress</MenuItem>
                            <MenuItem value="Completed">Completed</MenuItem>
                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        {task.files && task.files.length > 0 ? (
                          <Tooltip title={task.files.length + ' file(s)'}>
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
                      {/* Removed Flag cell with dropdown */}
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
            
            {/* User Information Text Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User Information"
                value={userInformation}
                onChange={(e) => setUserInformation(e.target.value)}
              />
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
            
            {/* Remove Flag Dropdown */}
            {/* 
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Flag</InputLabel>
                <Select 
                  label="Flag" 
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                >
                  <MenuItem value="None">None</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            */}
            
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
                          secondary={(file.size / 1024).toFixed(2) + ' KB - ' + file.type}
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
            
            {/* Add User Information field in Edit form */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="User Information"
                value={editUserInformation}
                onChange={(e) => setEditUserInformation(e.target.value)}
              />
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
                      <ListItem key={'edit-' + index}>
                        <ListItemText
                          primary={typeof file === 'string' ? file : file.name}
                          secondary={typeof file === 'string' ? 'Existing file' : (file.size / 1024).toFixed(2) + ' KB - ' + file.type}
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