import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  Box
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment, 
  Notifications 
} from '@mui/icons-material';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Task Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assignment sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5" component="div">
                  12
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Leave Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <EventAvailable sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h5" component="div">
                  3
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
        
        {/* Report Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Assessment sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h5" component="div">
                  5
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
        
        {/* Notification Summary */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Notifications sx={{ mr: 2, color: 'warning.main' }} />
                <Typography variant="h5" component="div">
                  7
                </Typography>
              </Box>
              <Typography color="text.secondary">
                Notifications
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">View Details</Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Task Chart Placeholder */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Task Distribution
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Task Chart Visualization
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        {/* Recent Activity Placeholder */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">
                Activity Timeline
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;