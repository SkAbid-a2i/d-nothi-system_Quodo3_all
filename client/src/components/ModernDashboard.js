import React, { useState, useEffect } from 'react';
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

const ModernDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingLeaves: 0,
    completedTasks: 0,
    activeUsers: 0
  });

  // Mock data for charts
  const taskData = [
    { name: 'Mon', tasks: 12 },
    { name: 'Tue', tasks: 19 },
    { name: 'Wed', tasks: 15 },
    { name: 'Thu', tasks: 18 },
    { name: 'Fri', tasks: 22 },
    { name: 'Sat', tasks: 8 },
    { name: 'Sun', tasks: 5 }
  ];

  const categoryData = [
    { name: 'IT Support', value: 45 },
    { name: 'HR', value: 25 },
    { name: 'Finance', value: 20 },
    { name: 'Admin', value: 10 }
  ];

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f59e0b'];

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setStats({
        totalTasks: 124,
        pendingLeaves: 8,
        completedTasks: 92,
        activeUsers: 24
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Task Activity
                  </Typography>
                  <Chip label="Last 7 days" size="small" />
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={taskData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                      <XAxis dataKey="name" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.9)', 
                          backdropFilter: 'blur(10px)',
                          borderRadius: 8,
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="tasks" name="Tasks Created" fill="#667eea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #f093fb10 0%, #f59e0b10 100%)',
              border: '1px solid rgba(240, 147, 251, 0.2)'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Task Categories
                  </Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(255, 255, 255, 0.9)', 
                          backdropFilter: 'blur(10px)',
                          borderRadius: 8,
                          border: '1px solid rgba(0, 0, 0, 0.1)'
                        }} 
                      />
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