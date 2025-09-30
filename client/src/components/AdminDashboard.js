import React, { useState } from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box,
  TextField,
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
  Tabs,
  Tab,
  IconButton,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment, 
  Notifications,
  Search as SearchIcon,
  Download as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('weekly');
  const [chartType, setChartType] = useState('bar');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [userFilter, setUserFilter] = useState('');
  
  // Widget state
  const [widgets, setWidgets] = useState([
    { id: 1, type: 'taskSummary', title: 'Task Summary', enabled: true },
    { id: 2, type: 'leaveCalendar', title: 'Leave Calendar', enabled: true },
    { id: 3, type: 'performanceMetrics', title: 'Performance Metrics', enabled: false },
    { id: 4, type: 'teamAvailability', title: 'Team Availability', enabled: true },
    { id: 5, type: 'customNote', title: 'Team Meeting Notes', enabled: true }
  ]);
  
  const [openAddWidgetDialog, setOpenAddWidgetDialog] = useState(false);
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState('note');

  // Mock data for team tasks
  const teamTasks = [
    { id: 1, user: 'John Doe', date: '2025-09-28', source: 'Email', category: 'IT Support', service: 'Hardware', status: 'Completed' },
    { id: 2, user: 'Jane Smith', date: '2025-09-29', source: 'Phone', category: 'HR', service: 'Leave', status: 'In Progress' },
    { id: 3, user: 'Bob Johnson', date: '2025-09-30', source: 'Walk-in', category: 'Finance', service: 'Billing', status: 'Pending' },
  ];

  // Mock data for pending leaves
  const pendingLeaves = [
    { id: 1, user: 'Alice Brown', startDate: '2025-10-15', endDate: '2025-10-17', reason: 'Personal work' },
    { id: 2, user: 'Charlie Wilson', startDate: '2025-11-05', endDate: '2025-11-06', reason: 'Medical appointment' },
  ];

  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`);
  };

  const handleApproveLeave = (leaveId) => {
    // Implement leave approval
    console.log(`Approving leave ${leaveId}`);
  };

  const handleRejectLeave = (leaveId) => {
    // Implement leave rejection
    console.log(`Rejecting leave ${leaveId}`);
  };
  
  const handleExport = (format) => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const toggleWidget = (widgetId) => {
    setWidgets(widgets.map(widget => 
      widget.id === widgetId 
        ? { ...widget, enabled: !widget.enabled } 
        : widget
    ));
  };
  
  const addWidget = () => {
    if (newWidgetTitle.trim()) {
      const newWidget = {
        id: Date.now(),
        type: newWidgetType,
        title: newWidgetTitle,
        enabled: true
      };
      setWidgets([...widgets, newWidget]);
      setNewWidgetTitle('');
      setOpenAddWidgetDialog(false);
    }
  };
  
  const removeWidget = (widgetId) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };
  
  const getWidgetContent = (widget) => {
    switch (widget.type) {
      case 'taskSummary':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Task Summary</Typography>
            <Typography>Total Tasks: 24</Typography>
            <Typography>Completed: 18</Typography>
            <Typography>Pending: 6</Typography>
          </Box>
        );
      case 'leaveCalendar':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Leave Calendar</Typography>
            <Typography>Today: 2 people on leave</Typography>
            <Typography>This week: 5 leave requests</Typography>
          </Box>
        );
      case 'performanceMetrics':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Performance Metrics</Typography>
            <Typography>Avg. Task Completion Time: 2.5 days</Typography>
            <Typography>On-time Rate: 85%</Typography>
          </Box>
        );
      case 'teamAvailability':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Team Availability</Typography>
            <Typography>Available Agents: 8/10</Typography>
            <Typography>On Leave Today: 2</Typography>
          </Box>
        );
      case 'note':
      case 'customNote':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{widget.title}</Typography>
            <Typography>This is a custom note widget. You can add your own content here.</Typography>
          </Box>
        );
      case 'table':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{widget.title}</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Column 1</TableCell>
                    <TableCell>Column 2</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Data 1</TableCell>
                    <TableCell>Data 2</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Data 3</TableCell>
                    <TableCell>Data 4</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      case 'graph':
        return (
          <Box sx={{ p: 2, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="h6">{widget.title}</Typography>
            <Typography>Graph Visualization</Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">{widget.title}</Typography>
            <Typography>Widget content</Typography>
          </Box>
        );
    }
  };
  
  const widgetTypes = [
    { value: 'note', label: 'Note' },
    { value: 'table', label: 'Table' },
    { value: 'graph', label: 'Graph' },
    { value: 'taskSummary', label: 'Task Summary' },
    { value: 'leaveCalendar', label: 'Leave Calendar' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div">
                  24
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Total Team Tasks
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventAvailable sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h5" component="div">
                  5
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Pending Leaves
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  8
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Reports Generated
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Notifications sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h5" component="div">
                  12
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Team Notifications
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Filters and Controls */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <FormControl fullWidth>
                  <InputLabel>Time Range</InputLabel>
                  <Select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    label="Time Range"
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Filter by User"
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon />
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={5}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton 
                    color={chartType === 'pie' ? 'primary' : 'default'}
                    onClick={() => setChartType('pie')}
                  >
                    <PieChartIcon />
                  </IconButton>
                  <IconButton 
                    color={chartType === 'bar' ? 'primary' : 'default'}
                    onClick={() => setChartType('bar')}
                  >
                    <BarChartIcon />
                  </IconButton>
                  <IconButton 
                    color={chartType === 'line' ? 'primary' : 'default'}
                    onClick={() => setChartType('line')}
                  >
                    <LineChartIcon />
                  </IconButton>
                  
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('CSV')}
                    sx={{ ml: 2 }}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    startIcon={<DownloadIcon />} 
                    onClick={() => handleExport('Excel')}
                  >
                    Export Excel
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
        </Grid>
        
        {/* Charts and Tables */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Team Performance - {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Visualization
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Team Tasks" />
              <Tab label="Pending Leaves" />
            </Tabs>
            
            {activeTab === 0 && (
              <TableContainer sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {teamTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.user}</TableCell>
                        <TableCell>{task.date}</TableCell>
                        <TableCell>{task.source}</TableCell>
                        <TableCell>{task.category}</TableCell>
                        <TableCell>{task.service}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status} 
                            color={
                              task.status === 'Completed' ? 'success' : 
                              task.status === 'In Progress' ? 'primary' : 'default'
                            } 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Pending Leave Requests
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingLeaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>{leave.user}</TableCell>
                          <TableCell>{leave.startDate}</TableCell>
                          <TableCell>{leave.endDate}</TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell>
                            <IconButton 
                              color="success" 
                              size="small"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => handleRejectLeave(leave.id)}
                            >
                              <CloseIcon />
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
        
        {/* Customizable Widgets */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customizable Widgets
            </Typography>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Task Summary"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Leave Calendar"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch />}
                label="Performance Metrics"
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Team Availability"
              />
            </Box>
            <Button variant="outlined" fullWidth>
              Add Widget
            </Button>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Who's on Leave Today
            </Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Leave Calendar View
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;