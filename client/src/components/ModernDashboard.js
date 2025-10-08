import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import { 
  Assignment, 
  EventAvailable, 
  Assessment, 
  Notifications,
  TrendingUp,
  People,
  CheckCircle,
  PendingActions
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { taskAPI, leaveAPI } from '../services/api';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';

const ModernDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingLeaves: 0,
    completedTasks: 0,
    activeUsers: 0
  });

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch tasks
      const tasksResponse = await taskAPI.getAllTasks();
      let tasksData = tasksResponse.data || [];
      
      // Filter tasks based on user role
      if (user && user.role === 'Agent') {
        tasksData = tasksData.filter(task => 
          task.userId === user.id || task.userName === user.username
        );
      } else if (user && (user.role === 'Admin' || user.role === 'Supervisor')) {
        tasksData = tasksData.filter(task => 
          task.office === user.office
        );
      }
      
      setTasks(tasksData);
      
      // Fetch leaves
      const leavesResponse = await leaveAPI.getAllLeaves();
      let leavesData = leavesResponse.data || [];
      
      // Filter leaves based on user role
      if (user && user.role === 'Agent') {
        leavesData = leavesData.filter(leave => 
          leave.userId === user.id || leave.userName === user.username
        );
      } else if (user && (user.role === 'Admin' || user.role === 'Supervisor')) {
        leavesData = leavesData.filter(leave => 
          leave.office === user.office
        );
      }
      
      setLeaves(leavesData);
      
      // Update stats
      setStats({
        totalTasks: tasksData.length,
        pendingLeaves: leavesData.filter(l => l.status === 'Pending').length,
        completedTasks: tasksData.filter(t => t.status === 'Completed').length,
        activeUsers: 0 // This would need to come from a user API in a real implementation
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Generate task data for charts based on actual tasks
  const getTaskData = useCallback(() => {
    // Group tasks by day of week
    const taskCountByDay = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    tasks.forEach(task => {
      if (task.date) {
        const dayIndex = new Date(task.date).getDay();
        const dayName = days[dayIndex];
        taskCountByDay[dayName] = (taskCountByDay[dayName] || 0) + 1;
      }
    });
    
    // Convert to chart data format
    return days.map(day => ({
      name: day,
      tasks: taskCountByDay[day] || 0
    }));
  }, [tasks]);

  // Generate category data for charts based on actual tasks
  const getCategoryData = useCallback(() => {
    // Group tasks by category
    const categoryCount = {};
    tasks.forEach(task => {
      const category = task.category || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category]
    }));
  }, [tasks]);

  const taskData = getTaskData();
  const categoryData = getCategoryData();
  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f59e0b'];

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('ModernDashboard', 'dashboard', fetchDashboardData, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('ModernDashboard');
    };
  }, [fetchDashboardData]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTaskCreated = () => {
      fetchDashboardData();
    };

    const handleTaskUpdated = () => {
      fetchDashboardData();
    };

    const handleLeaveRequested = () => {
      fetchDashboardData();
    };

    const handleLeaveApproved = () => {
      fetchDashboardData();
    };

    const handleLeaveRejected = () => {
      fetchDashboardData();
    };

    // Subscribe to notifications
    notificationService.onTaskCreated(handleTaskCreated);
    notificationService.onTaskUpdated(handleTaskUpdated);
    notificationService.onLeaveRequested(handleLeaveRequested);
    notificationService.onLeaveApproved(handleLeaveApproved);
    notificationService.onLeaveRejected(handleLeaveRejected);

    // Cleanup on unmount
    return () => {
      notificationService.off('taskCreated', handleTaskCreated);
      notificationService.off('taskUpdated', handleTaskUpdated);
      notificationService.off('leaveRequested', handleLeaveRequested);
      notificationService.off('leaveApproved', handleLeaveApproved);
      notificationService.off('leaveRejected', handleLeaveRejected);
    };
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#667eea',
      change: '+12%'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: <EventAvailable sx={{ fontSize: 40 }} />,
      color: '#f093fb',
      change: '-3%'
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#10b981',
      change: '+8%'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#f59e0b',
      change: '+5%'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
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
            Welcome back, {user?.fullName || user?.username}!
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Here's what's happening with your tasks today
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, index) => (
            <Zoom in={true} style={{ transitionDelay: `${index * 200}ms` }} key={card.title}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    background: `linear-gradient(135deg, ${card.color}20 0%, ${card.color}10 100%)`,
                    border: `1px solid ${card.color}20`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ 
                        width: 60, 
                        height: 60, 
                        borderRadius: '50%', 
                        bgcolor: `${card.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color
                      }}>
                        {card.icon}
                      </Box>
                      <Chip 
                        label={card.change} 
                        size="small" 
                        sx={{ 
                          bgcolor: card.change.startsWith('+') ? '#10b98120' : '#ef444420',
                          color: card.change.startsWith('+') ? '#10b981' : '#ef4444',
                          fontWeight: 600
                        }} 
                      />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Zoom>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Task Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={taskData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tasks" name="Tasks Created" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Task Categories
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default ModernDashboard;