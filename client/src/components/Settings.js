import React, { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Fade,
  Zoom,
  Avatar,
  TextField,
  Grid,
  Chip
} from '@mui/material';
import { 
  Language as LanguageIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const Settings = ({ darkMode, setDarkMode }) => {
  const { t, language, toggleLanguage } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSave = () => {
    // Simulate saving settings
    setSuccess('Settings saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <Fade in={true} timeout={600}>
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
            Settings
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Customize your experience
          </Typography>
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Zoom in={true} timeout={800}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Profile Settings
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      defaultValue="John Doe"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      defaultValue="john.doe@example.com"
                      type="email"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      defaultValue="johndoe"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Office"
                      defaultValue="Head Office"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      Update Profile
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <LanguageIcon sx={{ mr: 1 }} />
                  Language & Appearance
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Language</InputLabel>
                      <Select
                        value={language}
                        onChange={toggleLanguage}
                        label="Language"
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={darkMode}
                          onChange={() => setDarkMode(!darkMode)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {darkMode ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
                          {darkMode ? 'Dark Mode' : 'Light Mode'}
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Notifications
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications}
                          onChange={() => setNotifications(!notifications)}
                          color="primary"
                        />
                      }
                      label="Enable Notifications"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emailNotifications}
                          onChange={() => setEmailNotifications(!emailNotifications)}
                          color="primary"
                        />
                      }
                      label="Email Notifications"
                      sx={{ ml: 4 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={pushNotifications}
                          onChange={() => setPushNotifications(!pushNotifications)}
                          color="primary"
                        />
                      }
                      label="Push Notifications"
                      sx={{ ml: 4 }}
                    />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Security
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SecurityIcon />}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      Change Password
                    </Button>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4, textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSave}
                    startIcon={<SaveIcon />}
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #667eea)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Save All Settings
                  </Button>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Zoom in={true} timeout={1000}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    fontSize: 48,
                    bgcolor: 'primary.main',
                    color: 'white'
                  }}
                >
                  JD
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  John Doe
                </Typography>
                
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
                  System Administrator
                </Typography>
                
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Member since:</strong> Jan 15, 2023
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Last login:</strong> Today, 09:30 AM
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> 
                    <Chip 
                      label="Active" 
                      size="small" 
                      sx={{ 
                        ml: 1,
                        bgcolor: '#10b98120',
                        color: '#10b981',
                        fontWeight: 600
                      }} 
                    />
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default Settings;