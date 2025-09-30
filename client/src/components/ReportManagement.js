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
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment,
  Download as DownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
} from '@mui/icons-material';

const ReportManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const reports = [
    {
      id: 1,
      title: 'Task Report',
      description: 'Detailed report of all tasks',
      type: 'task'
    },
    {
      id: 2,
      title: 'Leave Report',
      description: 'Summary of all leave requests',
      type: 'leave'
    },
    {
      id: 3,
      title: 'Activity Report',
      description: 'User activity and system usage',
      type: 'activity'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const exportReport = (reportType, format) => {
    // Export logic would go here
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Report Management
      </Typography>
      
      {/* Report Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select label="Report Type" defaultValue="">
                <MenuItem value="">All Reports</MenuItem>
                <MenuItem value="task">Task Reports</MenuItem>
                <MenuItem value="leave">Leave Reports</MenuItem>
                <MenuItem value="activity">Activity Reports</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" fullWidth>
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Report Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab label="Task Reports" icon={<Assignment />} />
          <Tab label="Leave Reports" icon={<EventAvailable />} />
          <Tab label="Activity Reports" icon={<Assessment />} />
        </Tabs>
      </Paper>
      
      {/* Report Cards */}
      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} md={4} key={report.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {report.title}
                </Typography>
                <Typography color="text.secondary">
                  {report.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<DownloadIcon />}
                  onClick={() => exportReport(report.type, 'pdf')}
                >
                  PDF
                </Button>
                <Button 
                  size="small" 
                  onClick={() => exportReport(report.type, 'excel')}
                >
                  Excel
                </Button>
                <Button 
                  size="small" 
                  onClick={() => exportReport(report.type, 'csv')}
                >
                  CSV
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Chart Visualization */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data Visualization
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <BarChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1">Task Distribution</Typography>
              <Typography variant="body2" color="text.secondary">
                Bar chart showing task distribution by category
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <PieChartIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 1 }} />
              <Typography variant="subtitle1">Leave Status</Typography>
              <Typography variant="body2" color="text.secondary">
                Pie chart showing leave request status distribution
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <LineChartIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle1">Activity Trend</Typography>
              <Typography variant="body2" color="text.secondary">
                Line chart showing user activity over time
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReportManagement;