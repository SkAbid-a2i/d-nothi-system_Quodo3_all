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
  Zoom
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
import { dropdownAPI, taskAPI } from '../services/api';

const ModernTaskLogger = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: '',
    service: '',
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
    fetchDropdownValues();
    fetchTasks();
  }, []);

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
      setTasks(tasksData);
      setFilteredTasks(tasksData);
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
    // Filter tasks based on search and status
    let filtered = tasks;
    
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
      
      const response = await taskAPI.createTask(formData);
      console.log('Create task response:', response);
      const newTask = Array.isArray(response.data) ? response.data[0] : 
                     response.data?.data || response.data || {};
      
      setTasks([newTask, ...tasks]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        source: '',
        category: '',
        service: '',
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
      description: task.description,
      status: task.status
    });
    setOpenEditDialog(true);
  };

  const handleUpdateTask = async () => {
    try {
      setLoading(true);
      
      const response = await taskAPI.updateTask(editingTask.id, formData);
      console.log('Update task response:', response);
      const updatedTask = Array.isArray(response.data) ? response.data[0] : 
                         response.data?.data || response.data || {};
      
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? updatedTask : task
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

  // Handle status change directly from the table
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setLoading(true);
      
      const response = await taskAPI.updateTask(taskId, { status: newStatus });
      console.log('Update status response:', response);
      const updatedTask = Array.isArray(response.data) ? response.data[0] : 
                         response.data?.data || response.data || {};
      
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

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ flexGrow: 1 }}>
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
            Task Logger
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Create and manage your tasks efficiently
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Task Form */}
          <Grid item xs={12} lg={4}>
            <Zoom in={true} timeout={800}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Assignment sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Create New Task
                  </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Task History
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        size="small"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                          startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                        }}
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
                              <TableCell>Date</TableCell>
                              <TableCell>Source</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell>Service</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>User</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Flag</TableCell>
                              <TableCell>Actions</TableCell>
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
                                <TableCell>{task.date}</TableCell>
                                <TableCell>{task.source}</TableCell>
                                <TableCell>{task.category}</TableCell>
                                <TableCell>{task.service}</TableCell>
                                <TableCell>{task.description}</TableCell>
                                <TableCell>{task.userName}</TableCell>
                                <TableCell>
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
                                <TableCell>
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
                                <TableCell>
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
            <Button 
              onClick={() => setOpenEditDialog(false)}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTask} 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              disabled={loading || dropdownLoading}
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
      </Box>
    </Fade>
  );
};

export default ModernTaskLogger;