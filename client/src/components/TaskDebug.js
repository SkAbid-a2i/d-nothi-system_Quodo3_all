import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert 
} from '@mui/material';
import { taskAPI } from '../services/api';

const TaskDebug = () => {
  const [taskData, setTaskData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: 'Debug',
    category: 'Debug',
    service: 'Debug',
    description: 'Debug task',
    status: 'Pending'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateTask = async () => {
    setLoading(true);
    setResult(null);
    try {
      console.log('Creating task with data:', taskData);
      const response = await taskAPI.createTask(taskData);
      console.log('Task creation response:', response);
      setResult({ type: 'success', message: 'Task created successfully!', data: response.data });
    } catch (error) {
      console.error('Error creating task:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to create task';
      setResult({ type: 'error', message: `Failed to create task: ${errorMessage}`, error: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Task Debug
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create Task
        </Typography>
        
        <TextField
          fullWidth
          label="Date"
          type="date"
          name="date"
          value={taskData.date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Source"
          name="source"
          value={taskData.source}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Category"
          name="category"
          value={taskData.category}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Service"
          name="service"
          value={taskData.service}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={taskData.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Status"
          name="status"
          value={taskData.status}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        
        <Button 
          variant="contained" 
          onClick={handleCreateTask}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </Paper>
      
      {result && (
        <Alert 
          severity={result.type} 
          sx={{ mb: 2 }}
        >
          <Typography variant="body1">
            {result.message}
          </Typography>
          {result.data && (
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
              Response: {JSON.stringify(result.data, null, 2)}
            </Typography>
          )}
          {result.error && (
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>
              Error: {JSON.stringify(result.error, null, 2)}
            </Typography>
          )}
        </Alert>
      )}
    </Box>
  );
};

export default TaskDebug;