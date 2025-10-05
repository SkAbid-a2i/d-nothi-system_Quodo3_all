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
  Assignment
} from '@mui/icons-material';
import { useTranslation } from '../contexts/TranslationContext';

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

  // Mock data for dropdowns
  const sources = ['Email', 'Phone', 'Walk-in', 'Online Form', 'Other'];
  const categories = ['IT Support', 'HR', 'Finance', 'Administration', 'Other'];
  const services = ['Software', 'Hardware', 'Leave', 'Recruitment', 'Billing', 'Other'];
  const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Mock tasks data
  const mockTasks = [
    {
      id: 1,
      date: '2023-06-15',
      source: 'Email',
      category: 'IT Support',
      service: 'Software',
      description: 'User unable to access email system',
      status: 'Completed',
      userName: 'John Doe',
      createdAt: '2023-06-15T09:30:00Z'
    },
    {
      id: 2,
      date: '2023-06-16',
      source: 'Phone',
      category: 'HR',
      service: 'Leave',
      description: 'Leave request for annual vacation',
      status: 'In Progress',
      userName: 'Jane Smith',
      createdAt: '2023-06-16T14:15:00Z'
    },
    {
      id: 3,
      date: '2023-06-17',
      source: 'Walk-in',
      category: 'Finance',
      service: 'Billing',
      description: 'Invoice processing assistance needed',
      status: 'Pending',
      userName: 'Mike Johnson',
      createdAt: '2023-06-17T11:45:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading tasks
    setLoading(true);
    const timer = setTimeout(() => {
      setTasks(mockTasks);
      setFilteredTasks(mockTasks);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

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
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTask = {
        id: tasks.length + 1,
        ...formData,
        userName: 'Current User',
        createdAt: new Date().toISOString()
      };
      
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
      showSnackbar('Error creating task: ' + error.message, 'error');
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
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...formData } : task
      );
      
      setTasks(updatedTasks);
      setOpenEditDialog(false);
      setEditingTask(null);
      showSnackbar('Task updated successfully!', 'success');
    } catch (error) {
      showSnackbar('Error updating task: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      showSnackbar('Task deleted successfully!', 'success');
    } catch (error) {
      showSnackbar('Error deleting task: ' + error.message, 'error');
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
                        >
                          {sources.map(source => (
                            <MenuItem key={source} value={source}>{source}</MenuItem>
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
                        >
                          {categories.map(category => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
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
                        >
                          {services.map(service => (
                            <MenuItem key={service} value={service}>{service}</MenuItem>
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
                        disabled={loading}
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
          
          {/* Task List */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Recent Tasks
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
                <Tab label="My Tasks" />
              </Tabs>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Status</TableCell>
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
                          <TableCell>{task.description}</TableCell>
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
              )}
            </Paper>
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
                  >
                    {sources.map(source => (
                      <MenuItem key={source} value={source}>{source}</MenuItem>
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
                  >
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
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
                  >
                    {services.map(service => (
                      <MenuItem key={service} value={service}>{service}</MenuItem>
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
      </Box>
    </Fade>
  );
};

export default ModernTaskLogger;