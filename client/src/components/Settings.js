import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
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
  Chip,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { 
  Language as LanguageIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Bloodtype as BloodtypeIcon,
  Phone as PhoneIcon,
  Info as InfoIcon,
  Colorize as ColorizeIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { authAPI } from '../services/api';
import { useThemeContext } from '../contexts/ThemeContext';

const Settings = () => {
  const { t, language, changeLanguage } = useTranslation();
  const { user, updateUser } = useAuth();
  const { 
    darkMode,
    setDarkMode,
    primaryColor, 
    secondaryColor, 
    updatePrimaryColor, 
    updateSecondaryColor, 
    resetToDefaultColors,
    // Background customization
    backgroundType,
    backgroundColor,
    gradientEndColor,
    gradientDirection,
    backgroundImage,
    updateBackgroundType,
    updateBackgroundColor,
    updateGradientEndColor,
    updateGradientDirection,
    updateBackgroundImage
  } = useThemeContext();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    username: '',
    bloodGroup: '',
    phoneNumber: '',
    bio: '',
    designation: ''
  });
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize profile data from user context
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        bloodGroup: user.bloodGroup || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        designation: user.designation || ''
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError('');
    try {
      // Only send fields that exist in the database
      const profileUpdateData = {
        fullName: profileData.fullName,
        email: profileData.email,
        username: profileData.username,
        bloodGroup: profileData.bloodGroup,
        phoneNumber: profileData.phoneNumber,
        bio: profileData.bio,
        designation: profileData.designation,
        preferences: {
          theme: darkMode ? 'dark' : 'light',
          primaryColor,
          secondaryColor,
          backgroundType,
          backgroundColor,
          gradientEndColor,
          gradientDirection,
          backgroundImage
        }
      };
      
      const response = await authAPI.updateProfile(profileUpdateData);
      // Update user in context
      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to change password: ' + (err.response?.data?.message || err.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle color changes
  const handlePrimaryColorChange = (e) => {
    const newColor = e.target.value;
    updatePrimaryColor(newColor);
  };

  const handleSecondaryColorChange = (e) => {
    const newColor = e.target.value;
    updateSecondaryColor(newColor);
  };
  
  // Handle background customization changes
  const handleBackgroundTypeChange = (e) => {
    updateBackgroundType(e.target.value);
  };
  
  const handleBackgroundColorChange = (e) => {
    updateBackgroundColor(e.target.value);
  };
  
  const handleGradientEndColorChange = (e) => {
    updateGradientEndColor(e.target.value);
  };
  
  const handleGradientDirectionChange = (e) => {
    updateGradientDirection(e.target.value);
  };
  
  const handleBackgroundImageChange = (e) => {
    updateBackgroundImage(e.target.value);
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

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>
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
                      value={profileData.fullName}
                      onChange={(e) => handleProfileChange('fullName', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      type="email"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profileData.username}
                      onChange={(e) => handleProfileChange('username', e.target.value)}
                      // Removed disabled attribute to make username editable
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={profileData.phoneNumber}
                      onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Designation"
                      value={profileData.designation || ''}
                      onChange={(e) => handleProfileChange('designation', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Blood Group"
                      value={profileData.bloodGroup}
                      onChange={(e) => handleProfileChange('bloodGroup', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      multiline
                      rows={4}
                      value={profileData.bio}
                      onChange={(e) => handleProfileChange('bio', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center' }}>
                  <PaletteIcon sx={{ mr: 1 }} />
                  Theme & Colors
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Primary Color"
                      type="color"
                      value={primaryColor}
                      onChange={handlePrimaryColorChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ColorizeIcon sx={{ color: primaryColor }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Secondary Color"
                      type="color"
                      value={secondaryColor}
                      onChange={handleSecondaryColorChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ColorizeIcon sx={{ color: secondaryColor }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Gradient End Color"
                      type="color"
                      value={gradientEndColor}
                      onChange={handleGradientEndColorChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ColorizeIcon sx={{ color: gradientEndColor }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gradient Direction</InputLabel>
                      <Select
                        value={gradientDirection || 'to right'}
                        onChange={handleGradientDirectionChange}
                        label="Gradient Direction"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <MenuItem value="to right">Left to Right</MenuItem>
                        <MenuItem value="to bottom">Top to Bottom</MenuItem>
                        <MenuItem value="to bottom right">Diagonal</MenuItem>
                        <MenuItem value="radial">Radial</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Background Type</InputLabel>
                      <Select
                        value={backgroundType || 'solid'}
                        onChange={handleBackgroundTypeChange}
                        label="Background Type"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          }
                        }}
                      >
                        <MenuItem value="solid">Solid Color</MenuItem>
                        <MenuItem value="gradient">Gradient</MenuItem>
                        <MenuItem value="image">Image</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {(backgroundType === 'solid' || backgroundType === 'gradient') && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Background Color"
                        type="color"
                        value={backgroundColor}
                        onChange={handleBackgroundColorChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <ColorizeIcon sx={{ color: backgroundColor }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'divider',
                            },
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'primary.main',
                            }
                          }
                        }}
                      />
                    </Grid>
                  )}
                  
                  {backgroundType === 'gradient' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Gradient End Color"
                          type="color"
                          value={gradientEndColor}
                          onChange={handleGradientEndColorChange}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <ColorizeIcon sx={{ color: gradientEndColor }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: 'divider',
                              },
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'primary.main',
                              }
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Gradient Direction</InputLabel>
                          <Select
                            value={gradientDirection || 'to right'}
                            onChange={handleGradientDirectionChange}
                            label="Gradient Direction"
                            sx={{
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'primary.main',
                              }
                            }}
                          >
                            <MenuItem value="to right">Left to Right</MenuItem>
                            <MenuItem value="to bottom">Top to Bottom</MenuItem>
                            <MenuItem value="to bottom right">Diagonal</MenuItem>
                            <MenuItem value="radial">Radial</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </>
                  )}
                  
                  {backgroundType === 'image' && (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Background Image URL"
                        value={backgroundImage}
                        onChange={handleBackgroundImageChange}
                      />
                    </Grid>
                  )}
                  
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={resetToDefaultColors}
                      sx={{ 
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          color: 'primary.main',
                        }
                      }}
                    >
                      Reset to Default Colors
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
                        onChange={async (e) => {
                          const newLang = e.target.value;
                          changeLanguage(newLang);
                          
                          // Update preferences in backend
                          try {
                            const token = localStorage.getItem('token');
                            if (token) {
                              const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
                                method: 'PUT',
                                headers: {
                                  'Authorization': `Bearer ${token}`,
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  preferences: {
                                    language: newLang
                                  }
                                })
                              });
                            }
                          } catch (error) {
                            console.error('Error saving language preference:', error);
                          }
                        }}
                        label="Language"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'divider',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                          }
                        }}
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
                          onChange={async () => {
                            const newMode = !darkMode;
                            setDarkMode(newMode);
                            
                            // Update preferences in backend
                            try {
                              const token = localStorage.getItem('token');
                              if (token) {
                                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/profile`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    preferences: {
                                      theme: newMode ? 'dark' : 'light',
                                      primaryColor,
                                      secondaryColor,
                                      backgroundType,
                                      backgroundColor,
                                      gradientEndColor,
                                      gradientDirection,
                                      backgroundImage
                                    }
                                  })
                                });
                              }
                            } catch (error) {
                              console.error('Error saving theme preferences:', error);
                            }
                          }}
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
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'divider',
                          },
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <SecurityIcon />}
                      onClick={handleChangePassword}
                      disabled={loading}
                      sx={{ 
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #764ba2, #667eea)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                        }
                      }}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </Grid>
                </Grid>
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
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </Avatar>
                
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {user?.fullName || user?.username || 'User'}
                </Typography>
                
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
                  {user?.role || 'User'}
                </Typography>
                
                <Box sx={{ textAlign: 'left' }}>
                  {/* Removed "Member since" field as requested */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Last login:</strong> Today, 09:30 AM
                  </Typography>
                  {user?.designation && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Designation:</strong> {user.designation}
                    </Typography>
                  )}
                  {user?.bloodGroup && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <BloodtypeIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      <strong>Blood Group:</strong> {user.bloodGroup}
                    </Typography>
                  )}
                  {user?.phoneNumber && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      <strong>Phone:</strong> {user.phoneNumber}
                    </Typography>
                  )}
                  {user?.bio && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <InfoIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      <strong>Bio:</strong> {user.bio}
                    </Typography>
                  )}
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