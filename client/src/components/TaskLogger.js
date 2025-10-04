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
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { taskAPI, dropdownAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';
import notificationService from '../services/notificationService';
import frontendLogger from '../services/frontendLogger';

const TaskLogger = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [service, setService] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [file, setFile] = useState(null);
  
  // Today's tasks state
  const [todaysTasks, setTodaysTasks] = useState([]);
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

  // Fetch today's tasks
  const fetchTodaysTasks = async () => {
    setTasksLoading(true);
    try {
      const response = await taskAPI.getAllTasks();
      const allTasks = response.data || [];
      
      // Filter tasks for today
      const today = new Date().toISOString().split('T')[0];
      const todayTasks = allTasks.filter(task => 
        task.date && task.date.split('T')[0] === today
      );
      
      setTodaysTasks(todayTasks);
    } catch (error) {
      console.error('Error fetching today\'s tasks:', error);
      showSnackbar(t('tasks.errorFetchingTasks') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setTasksLoading(false);
    }
  };

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      frontendLogger.info('Real-time task created notification received', data);
      showSnackbar(`New task created: ${data.task.description}`, 'info');
      // Refresh today's tasks
      fetchTodaysTasks();
    };

    const handleTaskUpdated = (data) => {
      frontendLogger.info('Real-time task updated notification received', data);
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
      // Refresh today's tasks
      fetchTodaysTasks();
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);

    // Cleanup on unmount
    return () => {
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
    };
  }, []);

  // Fetch today's tasks on component mount
  useEffect(() => {
    fetchTodaysTasks();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const taskData = {
        date,
        source,
        category,
        service,
        description,
        status
      };
      
      const response = await taskAPI.createTask(taskData);
      
      // Log audit entry
      auditLog.taskCreated(response.data.id, user?.username || 'unknown');
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setSource('');
      setCategory('');
      setService('');
      setDescription('');
      setStatus('Pending');
      setFile(null);
      
      // Refresh today's tasks
      fetchTodaysTasks();
      
      showSnackbar(t('tasks.taskCreatedSuccessfully'), 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showSnackbar(t('tasks.errorCreatingTask') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle task edit
  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditDate(task.date ? task.date.split('T')[0] : '');
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
      
      // Log audit entry
      auditLog.taskUpdated(editingTask.id, user?.username || 'unknown');
      
      setOpenEditDialog(false);
      setEditingTask(null);
      
      // Refresh today's tasks
      fetchTodaysTasks();
      
      showSnackbar(t('tasks.taskUpdatedSuccessfully'), 'success');
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar(t('tasks.errorUpdatingTask') + ': ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Handle task delete
  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      
      // Log audit entry
      auditLog.taskDeleted(taskId, user?.username || 'unknown');
      
      // Refresh today's tasks
      fetchTodaysTasks();
      
      showSnackbar(t('tasks.taskDeletedSuccessfully'), 'success');
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar(t('tasks.errorDeletingTask') + ': ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('tasks.taskLogger')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('tasks.logNewTask')}
        </Typography>
        
        <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} sm={6}>
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
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>{t('tasks.source')}</InputLabel>
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                label={t('tasks.source')}
              >
                {sources.map((src) => (
                  <MenuItem key={src.id || src.value} value={src.value || src}>
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
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                label={t('tasks.category')}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id || cat.value} value={cat.value || cat}>
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
                value={service}
                onChange={(e) => setService(e.target.value)}
                label={t('tasks.service')}
              >
                {filteredServices.map((svc) => (
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
              label={t('tasks.description')}
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('tasks.status')}</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label={t('tasks.status')}
              >
                {statuses.map((stat) => (
                  <MenuItem key={stat} value={stat}>
                    <Chip 
                      label={stat} 
                      size="small" 
                      color={
                        stat === 'Completed' ? 'success' : 
                        stat === 'In Progress' ? 'primary' : 
                        stat === 'Cancelled' ? 'error' : 'default'
                      } 
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
            >
              {t('tasks.uploadFile')}
              <input
                type="file"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </Button>
            {file && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {file.name}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
              disabled={loading}
            >
              {loading ? t('common.creating') : t('tasks.createTask')}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Today's Tasks */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Today's Tasks
        </Typography>
        
        {tasksLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : todaysTasks.length === 0 ? (
          <Typography color="text.secondary" align="center" sx={{ p: 2 }}>
            No tasks logged today
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {todaysTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      {task.createdAt ? new Date(task.createdAt).toLocaleTimeString() : 'N/A'}
                    </TableCell>
                    <TableCell>{task.source || 'N/A'}</TableCell>
                    <TableCell>{task.category || 'N/A'}</TableCell>
                    <TableCell>{task.service || 'N/A'}</TableCell>
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
      </Paper>
      
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
                  {sources.map((src) => (
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
                  {categories.map((cat) => (
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