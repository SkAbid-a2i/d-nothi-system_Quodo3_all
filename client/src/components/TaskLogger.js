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
  Autocomplete,
  LinearProgress,
  Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Upload as UploadIcon
} from '@mui/icons-material';
import { dropdownAPI, taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';

const TaskLogger = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [sources, setSources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSource, setSelectedSource] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [description, setDescription] = useState('');
  const [userInfo, setUserInfo] = useState('');
  const [status, setStatus] = useState('Pending');
  const [comment, setComment] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch dropdown values on component mount
  useEffect(() => {
    fetchDropdownValues();
  }, []);

  const fetchDropdownValues = async () => {
    setLoading(true);
    try {
      const [sourcesRes, categoriesRes, officesRes] = await Promise.all([
        dropdownAPI.getDropdownValues('Source'),
        dropdownAPI.getDropdownValues('Category'),
        dropdownAPI.getDropdownValues('Office')
      ]);
      
      setSources(sourcesRes.data);
      setCategories(categoriesRes.data);
      setOffices(officesRes.data);
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

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Check if file size would exceed quota
      const newUsedStorage = 50 + (selectedFile.size / (1024 * 1024)); // Convert to MB
      if (newUsedStorage > 500) {
        alert('File upload would exceed your storage quota!');
        return;
      }
      
      setFile(selectedFile);
      // Simulate upload progress
      simulateUploadProgress();
    }
  };

  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Prepare task data
      const taskData = {
        date: new Date().toISOString(),
        source: selectedSource?.value,
        category: selectedCategory?.value,
        service: selectedService?.value,
        userInfo,
        office: selectedOffice?.value,
        description,
        status,
        comment,
        file: file ? file.name : null
      };
      
      // Create task (this will automatically create audit log on backend)
      const response = await taskAPI.createTask(taskData);
      
      // Log audit entry
      auditLog.taskCreated(response.data.id, user?.username || 'unknown');
      
      // Reset form
      setSelectedSource(null);
      setSelectedCategory(null);
      setSelectedService(null);
      setSelectedOffice(null);
      setDescription('');
      setUserInfo('');
      setStatus('Pending');
      setComment('');
      setFile(null);
      setUploadProgress(0);
      
      setSuccess('Task created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('tasks.taskLogger')}
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('tasks.createNewTask')}
        </Typography>
        
        {loading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
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
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date & Time"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={sources}
                getOptionLabel={(option) => option.value}
                value={selectedSource}
                onChange={(event, newValue) => setSelectedSource(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label={t('tasks.source')} fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.value}
                value={selectedCategory}
                onChange={(event, newValue) => setSelectedCategory(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label={t('tasks.category')} fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={services}
                getOptionLabel={(option) => option.value}
                value={selectedService}
                onChange={(event, newValue) => setSelectedService(newValue)}
                disabled={!selectedCategory}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label={t('tasks.service')} 
                    fullWidth 
                    disabled={!selectedCategory}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('tasks.assignedTo')}
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={offices}
                getOptionLabel={(option) => option.value}
                value={selectedOffice}
                onChange={(event, newValue) => setSelectedOffice(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label={t('users.office')} fullWidth />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('tasks.description')}
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('tasks.status')}</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('tasks.description')}
                multiline
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="*/*"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    {t('common.upload')}
                  </Button>
                </label>
                
                {file && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Selected file: {file.name}
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        {Math.round((50 / 500) * 100)}% of quota used
                      </Typography>
                      <Typography variant="body2">
                        50 MB / 500 MB
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                type="submit"
                fullWidth
                size="large"
              >
                {t('common.submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default TaskLogger;