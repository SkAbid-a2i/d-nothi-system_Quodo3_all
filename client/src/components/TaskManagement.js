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
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { dropdownAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
// import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';

const TaskManagement = () => {
  const { user } = useAuth();
  // const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [assignedTo, setAssignedTo] = useState('');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTasks = useCallback(async () => {
    setDataLoading(true);
    try {
      const response = await taskAPI.getAllTasks();
      setTasks(response.data);
      
      // Log audit entry
      auditLog.taskCreated(response.data.length, user?.username || 'unknown');
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks');
    } finally {
      setDataLoading(false);
    }
  }, [user?.username]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchDropdownValues();
  }, [fetchTasks]);

  // Fetch dropdown values on component mount
  useEffect(() => {
    fetchDropdownValues();
  }, []);

  const fetchDropdownValues = async () => {
    setLoading(true);
    try {
      const [sourcesRes, categoriesRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category')
      ]);
      
      setSources(sourcesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch services when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchServicesForCategory(selectedCategory.value);
    } else {
      setServices([]);
      setSelectedService(null);
    }
  }, [selectedCategory]);

  const fetchServicesForCategory = async (categoryValue) => {
    try {
      const response = await dropdownAPI.getDropdownValues('Service', categoryValue);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      // Log audit entry
      auditLog.taskDeleted(taskId, user?.username || 'unknown');
      
      setSuccess('Task deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task');
      setTimeout(() => setError(''), 5000);
    }
  };
  
  const handleSubmitTask = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const taskData = {
        date,
        source: selectedSource?.value || '',
        category: selectedCategory?.value || '',
        service: selectedService?.value || '',
        description,
        status,
        assignedTo
      };
      
      const response = await taskAPI.createTask(taskData);
      
      // Add new task to list
      const newTask = {
        id: response.data.id,
        ...taskData
      };
      setTasks([...tasks, newTask]);
      
      // Log audit entry
      auditLog.taskCreated(response.data.id, user?.username || 'unknown');
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedSource(null);
      setSelectedCategory(null);
      setSelectedService(null);
      setDescription('');
      setStatus('Pending');
      setAssignedTo('');
      
      setSuccess('Task created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task');
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>
      
      {/* Task Form */}
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
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Task
        </Typography>
        <Grid container spacing={2} component="form" onSubmit={handleSubmitTask}>
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
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
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Assigned To"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<AddIcon />} type="submit">
              Create Task
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Task Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
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
          <Grid item xs={12} sm={3}>
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
          <Grid item xs={12} sm={4}>
            <Button variant="outlined" sx={{ mr: 1 }}>
              Filter
            </Button>
            <Button variant="outlined">
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Task List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.date}</TableCell>
                <TableCell>{task.source}</TableCell>
                <TableCell>{task.category}</TableCell>
                <TableCell>{task.service}</TableCell>
                <TableCell>{task.description}</TableCell>
                <TableCell>
                  <Chip 
                    label={task.status} 
                    color={
                      task.status === 'Completed' ? 'success' : 
                      task.status === 'In Progress' ? 'primary' : 'default'
                    } 
                  />
                </TableCell>
                <TableCell>{task.assignedTo}</TableCell>
                <TableCell>
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TaskManagement;