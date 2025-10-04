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
  Alert
} from '@mui/material';
import { Add as AddIcon, Upload as UploadIcon } from '@mui/icons-material';
import { taskAPI } from '../services/api';
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
  
  // Dropdown options
  const sources = ['Email', 'Phone', 'Walk-in', 'Online Form', 'Other'];
  const categories = ['IT Support', 'HR', 'Finance', 'Administration', 'Other'];
  const services = ['Software', 'Hardware', 'Leave', 'Recruitment', 'Billing', 'Other'];
  const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = (data) => {
      frontendLogger.info('Real-time task created notification received', data);
      showSnackbar(`New task created: ${data.task.description}`, 'info');
    };

    const handleTaskUpdated = (data) => {
      frontendLogger.info('Real-time task updated notification received', data);
      if (data.deleted) {
        showSnackbar(`Task deleted: ${data.description}`, 'warning');
      } else {
        showSnackbar(`Task updated: ${data.task.description}`, 'info');
      }
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
      
      showSnackbar(t('tasks.taskCreatedSuccessfully'), 'success');
    } catch (error) {
      console.error('Error creating task:', error);
      showSnackbar(t('tasks.errorCreatingTask') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('tasks.taskLogger')}
      </Typography>
      
      <Paper sx={{ p: 3 }}>
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
                  <MenuItem key={src} value={src}>{src}</MenuItem>
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
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
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
                {services.map((svc) => (
                  <MenuItem key={svc} value={svc}>{svc}</MenuItem>
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