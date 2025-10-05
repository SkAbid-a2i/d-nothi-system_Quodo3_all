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
  Tab
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { taskAPI, dropdownAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';
import notificationService from '../services/notificationService';
import frontendLogger from '../services/frontendLogger';
import ModernTaskLogger from './ModernTaskLogger';

const TaskLogger = () => {
  // For now, we'll use the modern task logger
  // You can switch back to the original component if needed
  return <ModernTaskLogger />;
  
  // Original implementation (commented out for now)
  /*
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // All tasks state (not just today's)
  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  
  // Edit task dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSource, setEditSource] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editService, setEditService] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('');
  
  // Dropdown options (fetched from API)
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [statuses] = useState(['Pending', 'In Progress', 'Completed', 'Cancelled']);
  
  // Service filtering based on category
  const [filteredServices, setFilteredServices] = useState([]);
  const [filteredEditServices, setFilteredEditServices] = useState([]);

  // Fetch dropdown values on component mount
  useEffect(() => {
    fetchDropdownValues();
  }, []);

  // Filter services when category changes
  useEffect(() => {
    if (category && services.length > 0) {
      const filtered = services.filter(svc => 
        svc.parentValue === category || !svc.parentValue
      );
      setFilteredServices(filtered);
    } else {
      setFilteredServices(services);
    }
  }, [category, services]);

  // Filter services when edit category changes
  useEffect(() => {
    if (editCategory && services.length > 0) {
      const filtered = services.filter(svc => 
        svc.parentValue === editCategory || !svc.parentValue
      );
      setFilteredEditServices(filtered);
    } else {
      setFilteredEditServices(services);
    }
  }, [editCategory, services]);

  const fetchDropdownValues = async () => {
    try {
      // Fetch sources
      const sourcesResponse = await dropdownAPI.getDropdownValues('Source');
      setSources(sourcesResponse.data || []);
      
      // Fetch categories
      const categoriesResponse = await dropdownAPI.getDropdownValues('Category');
      setCategories(categoriesResponse.data || []);
      
      // Fetch services
      const servicesResponse = await dropdownAPI.getDropdownValues('Service');
      setServices(servicesResponse.data || []);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      // Fallback to hardcoded values if API fails
      setSources(['Email', 'Phone', 'Walk-in', 'Online Form', 'Other']);
      setCategories(['IT Support', 'HR', 'Finance', 'Administration', 'Other']);
      setServices(['Software', 'Hardware', 'Leave', 'Recruitment', 'Billing', 'Other']);
    }
  };

  // Fetch all tasks
  const fetchAllTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      console.log('Fetching all tasks...');
      const response = await taskAPI.getAllTasks();
      console.log('Tasks response:', response);
      // Ensure we're setting an array - API might return an object with data property
      const tasksData = Array.isArray(response.data) ? response.data : 
                       response.data?.data || response.data || [];
      setAllTasks(tasksData);
      console.log('Tasks fetched successfully, count:', tasksData.length);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error response:', error.response);
      showSnackbar(t('tasks.errorFetchingTasks') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setTasksLoading(false);
    }
  }, [t]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      frontendLogger.info('Real-time task created notification received', data);
      showSnackbar(`New task created: ${data.task.description}`, 'info');
      // Refresh all tasks
      fetchAllTasks();
    };

    const handleTaskUpdated = (data) => {
      frontendLogger.info('Real-time task updated notification received', data);
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
      // Refresh all tasks
      fetchAllTasks();
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);

    // Cleanup on unmount
    return () => {
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
    };
  }, [fetchAllTasks]);

  // Fetch all tasks on component mount
  useEffect(() => {
    console.log('TaskLogger component mounted, fetching tasks...');
    fetchAllTasks();
  }, [fetchAllTasks]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!date || !source || !category || !description) {
      showSnackbar(t('tasks.pleaseFillAllFields'), 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const taskData = {
        date,
        source,
        category,
        service,
        description,
        status
      };
      
      await taskAPI.createTask(taskData);
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSource('');
      setCategory('');
      setService('');
      setDescription('');
      setStatus('Pending');
      
      showSnackbar(t('tasks.taskCreatedSuccessfully'), 'success');
      
      // Refresh tasks
      fetchAllTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      showSnackbar(t('tasks.errorCreatingTask') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (task) => {
    // Fetch dropdown values for edit dialog
    try {
      const [sourcesRes, categoriesRes, servicesRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Service')
      ]);
      
      setSources(sourcesRes.data || []);
      setCategories(categoriesRes.data || []);
      setServices(servicesRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown values for edit:', error);
      setSources(['Email', 'Phone', 'Walk-in', 'Online Form', 'Other']);
      setCategories(['IT Support', 'HR', 'Finance', 'Administration', 'Other']);
      setServices(['Software', 'Hardware', 'Leave', 'Recruitment', 'Billing', 'Other']);
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
      fetchAllTasks(); // Refresh data
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Error updating task: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      showSnackbar('Task deleted successfully!', 'success');
      fetchAllTasks(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Error deleting task: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = !searchTerm || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesSource = !sourceFilter || task.source === sourceFilter;
    const matchesCategory = !categoryFilter || task.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesSource && matchesCategory;
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Get today's tasks
  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return allTasks.filter(task => task.date === today);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('tasks.title')}
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('tasks.logNewTask')} icon={<AddIcon />} />
          <Tab label={t('tasks.todayTasks')} icon={<SearchIcon />} />
          <Tab label={t('tasks.allTasks')} icon={<SearchIcon />} />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('tasks.logNewTask')}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={t('tasks.date')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>{t('tasks.source')}</InputLabel>
                  <Select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    label={t('tasks.source')}
                  >
                    {sources.map((src) => (
                      <MenuItem key={src.value || src} value={src.value || src}>
                        {src.value || src}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>{t('tasks.category')}</InputLabel>
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    label={t('tasks.category')}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat.value || cat} value={cat.value || cat}>
                        {cat.value || cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth required>
                  <InputLabel>{t('tasks.service')}</InputLabel>
                  <Select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    label={t('tasks.service')}
                    disabled={!category}
                  >
                    {filteredServices.map((svc) => (
                      <MenuItem key={svc.value || svc} value={svc.value || svc}>
                        {svc.value || svc}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('tasks.description')}
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>{t('tasks.status')}</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    label={t('tasks.status')}
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={t('tasks.user')}
                  value={user?.fullName || user?.username || ''}
                  disabled
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : t('tasks.createTask')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<CancelIcon />}
                    onClick={() => {
                      setSource('');
                      setCategory('');
                      setService('');
                      setDescription('');
                      setStatus('Pending');
                    }}
                  >
                    {t('common.reset')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('tasks.todayTasks')}
          </Typography>
          
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : getTodaysTasks().length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ p: 3 }}>
              {t('tasks.noTasksToday')}
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('tasks.time')}</TableCell>
                    <TableCell>{t('tasks.source')}</TableCell>
                    <TableCell>{t('tasks.category')}</TableCell>
                    <TableCell>{t('tasks.service')}</TableCell>
                    <TableCell>{t('tasks.description')}</TableCell>
                    <TableCell>{t('tasks.user')}</TableCell>
                    <TableCell>{t('tasks.status')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTodaysTasks().map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.date ? new Date(task.date).toLocaleTimeString() : 'N/A'}</TableCell>
                      <TableCell>{task.source || 'N/A'}</TableCell>
                      <TableCell>{task.category || 'N/A'}</TableCell>
                      <TableCell>{task.service || 'N/A'}</TableCell>
                      <TableCell>{task.description || 'N/A'}</TableCell>
                      <TableCell>{task.userName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status || 'Pending'} 
                          color={getStatusColor(task.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEditTask(task)}>
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
          )}
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('tasks.allTasks')}
          </Typography>
          
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon fontSize="small" />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('tasks.status')}</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label={t('tasks.status')}
                  >
                    <MenuItem value="">All</MenuItem>
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('tasks.source')}</InputLabel>
                  <Select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    label={t('tasks.source')}
                  >
                    <MenuItem value="">All</MenuItem>
                    {sources.map((src) => (
                      <MenuItem key={src.value || src} value={src.value || src}>
                        {src.value || src}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>{t('tasks.category')}</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label={t('tasks.category')}
                  >
                    <MenuItem value="">All</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat.value || cat} value={cat.value || cat}>
                        {cat.value || cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setSourceFilter('');
                      setCategoryFilter('');
                    }}
                  >
                    {t('common.reset')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredTasks.length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ p: 3 }}>
              {t('tasks.noTasksFound')}
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('tasks.date')}</TableCell>
                    <TableCell>{t('tasks.time')}</TableCell>
                    <TableCell>{t('tasks.source')}</TableCell>
                    <TableCell>{t('tasks.category')}</TableCell>
                    <TableCell>{t('tasks.service')}</TableCell>
                    <TableCell>{t('tasks.description')}</TableCell>
                    <TableCell>{t('tasks.user')}</TableCell>
                    <TableCell>{t('tasks.status')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.date ? new Date(task.date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{task.date ? new Date(task.date).toLocaleTimeString() : 'N/A'}</TableCell>
                      <TableCell>{task.source || 'N/A'}</TableCell>
                      <TableCell>{task.category || 'N/A'}</TableCell>
                      <TableCell>{task.service || 'N/A'}</TableCell>
                      <TableCell>{task.description || 'N/A'}</TableCell>
                      <TableCell>{task.userName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status || 'Pending'} 
                          color={getStatusColor(task.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleEditTask(task)}>
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
          )}
        </Paper>
      )}
      
      {/* Edit Task Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{t('tasks.editTask')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('tasks.date')}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('tasks.source')}</InputLabel>
                <Select
                  value={editSource}
                  onChange={(e) => setEditSource(e.target.value)}
                  label={t('tasks.source')}
                >
                  {sources.map((src) => (
                    <MenuItem key={src.value || src} value={src.value || src}>
                      {src.value || src}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('tasks.category')}</InputLabel>
                <Select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  label={t('tasks.category')}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value || cat} value={cat.value || cat}>
                      {cat.value || cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('tasks.service')}</InputLabel>
                <Select
                  value={editService}
                  onChange={(e) => setEditService(e.target.value)}
                  label={t('tasks.service')}
                  disabled={!editCategory}
                >
                  {filteredEditServices.map((svc) => (
                    <MenuItem key={svc.value || svc} value={svc.value || svc}>
                      {svc.value || svc}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('tasks.description')}
                multiline
                rows={4}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('tasks.status')}</InputLabel>
                <Select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  label={t('tasks.status')}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('tasks.user')}
                value={editingTask?.userName || ''}
                disabled
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleUpdateTask} 
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            {t('common.save')}
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

export default TaskLogger;