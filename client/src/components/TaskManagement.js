import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      date: '2025-09-28',
      source: 'Email',
      category: 'IT Support',
      service: 'Hardware',
      description: 'Monitor not working',
      status: 'Completed',
      assignedTo: 'John Doe'
    },
    {
      id: 2,
      date: '2025-09-29',
      source: 'Phone',
      category: 'HR',
      service: 'Leave',
      description: 'Leave application approval',
      status: 'In Progress',
      assignedTo: 'Jane Smith'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Task Management
      </Typography>
      
      {/* Task Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Task
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select label="Source">
                <MenuItem value="Email">Email</MenuItem>
                <MenuItem value="Phone">Phone</MenuItem>
                <MenuItem value="Walk-in">Walk-in</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                <MenuItem value="IT Support">IT Support</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Service</InputLabel>
              <Select label="Service">
                <MenuItem value="Hardware">Hardware</MenuItem>
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Network">Network</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select label="Status" defaultValue="Pending">
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
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<AddIcon>}>
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