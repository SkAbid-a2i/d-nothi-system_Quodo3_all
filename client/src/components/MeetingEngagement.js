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
  Chip,
  IconButton,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { userAPI, meetingAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

const MeetingEngagement = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    subject: '',
    platform: 'zoom',
    location: '',
    date: '',
    time: '',
    duration: '30',
    selectedUsers: []
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [meetingDetailDialogOpen, setMeetingDetailDialogOpen] = useState(false);

  // Fetch users and meetings on component mount
  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchMeetings();
    }
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      // Handle different response structures
      const usersData = response.data?.data || response.data || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      // Set empty array on error to prevent blank page
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await meetingAPI.getAllMeetings();
      // Handle different response structures
      const meetingsData = response.data?.data || response.data || [];
      
      // Ensure each meeting has proper user data
      const processedMeetings = Array.isArray(meetingsData) ? meetingsData.map(meeting => ({
        ...meeting,
        users: meeting.selectedUsers || meeting.users || []
      })) : [];
      
      setMeetings(processedMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Don't show error for meetings as it's not critical, but set empty array
      setMeetings([]);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => {
      const selectedUsers = prev.selectedUsers.includes(userId)
        ? prev.selectedUsers.filter(id => id !== userId)
        : [...prev.selectedUsers, userId];
      
      return {
        ...prev,
        selectedUsers
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.subject || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (formData.selectedUsers.length === 0) {
      setError('Please select at least one user');
      showSnackbar('Please select at least one user', 'error');
      return;
    }

    try {
      setSaving(true);
      
      // Create meeting object
      const meetingData = {
        ...formData,
        selectedUserIds: formData.selectedUsers
      };

      // Create meeting through API
      const response = await meetingAPI.createMeeting(meetingData);
      
      // Handle response
      const newMeeting = response.data?.data || response.data || {};
      // Add to meetings list at the beginning
      setMeetings(prev => [newMeeting, ...prev]);
      
      // Send notifications to selected users
      const selectedUsersDetails = users.filter(u => formData.selectedUsers.includes(u.id));
      if (selectedUsersDetails.length > 0) {
        sendMeetingNotifications({...newMeeting, users: selectedUsersDetails});
      }
      
      // Reset form
      setFormData({
        subject: '',
        platform: 'zoom',
        location: '',
        date: '',
        time: '',
        duration: '30',
        selectedUsers: []
      });
      
      setSuccess('Meeting created successfully!');
      showSnackbar('Meeting created successfully!', 'success');
      
      // Close dialog if it's open
      setOpenDialog(false);
      
      // Refresh meetings to ensure consistency
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create meeting';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditMeeting = (meeting) => {
    setFormData({
      subject: meeting.subject || '',
      platform: meeting.platform || 'zoom',
      location: meeting.location || '',
      date: meeting.date || '',
      time: meeting.time || '',
      duration: meeting.duration || '30',
      selectedUsers: meeting.selectedUserIds || meeting.selectedUsers?.map(u => u.id) || []
    });
    setSelectedMeeting(meeting);
    setOpenDialog(true);
  };

  const handleUpdateMeeting = async () => {
    if (!selectedMeeting) return;

    // Validation
    if (!formData.subject || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    if (formData.selectedUsers.length === 0) {
      setError('Please select at least one user');
      showSnackbar('Please select at least one user', 'error');
      return;
    }

    try {
      setSaving(true);
      
      // Update meeting object
      const meetingData = {
        ...formData,
        selectedUserIds: formData.selectedUsers
      };

      // Update meeting through API
      const response = await meetingAPI.updateMeeting(selectedMeeting.id, meetingData);
      
      // Handle response
      const updatedMeeting = response.data?.data || response.data || {};
      
      // Update meetings list
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
      
      // Send notifications to selected users
      const selectedUsersDetails = users.filter(u => formData.selectedUsers.includes(u.id));
      if (selectedUsersDetails.length > 0) {
        sendMeetingNotifications({...updatedMeeting, users: selectedUsersDetails}, 'updated');
      }
      
      // Reset form
      setFormData({
        subject: '',
        platform: 'zoom',
        location: '',
        date: '',
        time: '',
        duration: '30',
        selectedUsers: []
      });
      
      setSelectedMeeting(null);
      setSuccess('Meeting updated successfully!');
      showSnackbar('Meeting updated successfully!', 'success');
      
      // Close dialog
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating meeting:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update meeting';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await meetingAPI.deleteMeeting(meetingId);
      
      // Remove from meetings list
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
      
      setSuccess('Meeting deleted successfully!');
      showSnackbar('Meeting deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete meeting';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      subject: '',
      platform: 'zoom',
      location: '',
      date: '',
      time: '',
      duration: '30',
      selectedUsers: []
    });
    setSelectedMeeting(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedMeeting(null);
    setFormData({
      subject: '',
      platform: 'zoom',
      location: '',
      date: '',
      time: '',
      duration: '30',
      selectedUsers: []
    });
  };

  const handleOpenMeetingDetail = (meeting) => {
    setSelectedMeeting(meeting);
    setMeetingDetailDialogOpen(true);
  };

  const handleCloseMeetingDetail = () => {
    setMeetingDetailDialogOpen(false);
    setSelectedMeeting(null);
  };

  const sendMeetingNotifications = (meeting, action = 'created') => {
    // In a real implementation, this would send notifications to selected users
    console.log(`Meeting ${action}:`, meeting);
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'N/A';
    try {
      const dateTime = new Date(`${date}T${time}`);
      return dateTime.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getDurationLabel = (minutes) => {
    const mins = parseInt(minutes);
    if (mins < 60) return `${mins} min`;
    if (mins === 60) return '1 hour';
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hours} hours`;
    return `${hours}h ${remainingMins}m`;
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'zoom': return <VideoCallIcon sx={{ color: '#2D8CFF' }} />;
      case 'teams': return <VideoCallIcon sx={{ color: '#6264A7' }} />;
      case 'meet': return <VideoCallIcon sx={{ color: '#00897B' }} />;
      case 'skype': return <VideoCallIcon sx={{ color: '#00AFF0' }} />;
      default: return <VideoCallIcon />;
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'zoom': return '#2D8CFF';
      case 'teams': return '#6264A7';
      case 'meet': return '#00897B';
      case 'skype': return '#00AFF0';
      default: return '#667eea';
    }
  };

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%)', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
        background: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Meetings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Schedule and manage your meetings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '50px',
            padding: '12px 24px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
            }
          }}
        >
          Schedule Meeting
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {meetings.map((meeting) => (
            <Grid item xs={12} md={6} lg={4} key={meeting.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    mb: 2
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        flex: 1,
                        wordBreak: 'break-word',
                        color: '#333'
                      }}
                    >
                      {meeting.subject || 'No Subject'}
                    </Typography>
                    <Chip
                      icon={getPlatformIcon(meeting.platform)}
                      label={meeting.platform || 'zoom'}
                      size="small"
                      sx={{ 
                        ml: 1,
                        fontWeight: 600,
                        borderRadius: '20px',
                        bgcolor: `${getPlatformColor(meeting.platform)}20`,
                        color: getPlatformColor(meeting.platform),
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    p: 1,
                    bgcolor: 'rgba(102, 126, 234, 0.1)',
                    borderRadius: '8px'
                  }}>
                    <PersonIcon sx={{ 
                      fontSize: 16, 
                      mr: 1, 
                      color: '#667eea' 
                    }} />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 500,
                        color: '#667eea'
                      }}
                    >
                      {meeting.creator?.fullName || meeting.creator?.username || 'Unknown Creator'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ fontSize: 18, mr: 1, color: '#667eea' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {meeting.date ? new Date(meeting.date).toLocaleDateString() : 'No Date'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 18, mr: 1, color: '#667eea' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {meeting.time || 'No Time'} ({getDurationLabel(meeting.duration)})
                      </Typography>
                    </Box>
                    {meeting.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOnIcon sx={{ fontSize: 18, mr: 1, color: '#667eea' }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {meeting.location}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {meeting.users && meeting.users.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        Participants ({meeting.users.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {meeting.users.slice(0, 3).map((user, index) => (
                          <Tooltip key={user.id} title={user.fullName || user.username}>
                            <Avatar 
                              sx={{ 
                                width: 24, 
                                height: 24, 
                                fontSize: '0.7rem',
                                bgcolor: '#667eea'
                              }}
                            >
                              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </Avatar>
                          </Tooltip>
                        ))}
                        {meeting.users.length > 3 && (
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              fontSize: '0.7rem',
                              bgcolor: '#764ba2'
                            }}
                          >
                            +{meeting.users.length - 3}
                          </Avatar>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>

                <CardActions sx={{ 
                  justifyContent: 'space-between', 
                  p: 2,
                  pt: 0
                }}>
                  <Button 
                    size="small" 
                    onClick={() => handleOpenMeetingDetail(meeting)}
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      color: '#667eea'
                    }}
                  >
                    View Details
                  </Button>
                  <Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleEditMeeting(meeting)}
                      sx={{ 
                        mr: 1,
                        background: 'rgba(102, 126, 234, 0.1)',
                        '&:hover': {
                          background: 'rgba(102, 126, 234, 0.2)'
                        }
                      }}
                    >
                      <EditIcon sx={{ color: '#667eea' }} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteMeeting(meeting.id)}
                      sx={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': {
                          background: 'rgba(239, 68, 68, 0.2)'
                        }
                      }}
                    >
                      <DeleteIcon sx={{ color: '#ef4444' }} />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Meeting Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)', 
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}>
          {selectedMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ fontWeight: 500 }}>Platform</InputLabel>
                  <Select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    label="Platform"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea'
                        }
                      }
                    }}
                  >
                    <MenuItem value="zoom">Zoom</MenuItem>
                    <MenuItem value="teams">Microsoft Teams</MenuItem>
                    <MenuItem value="meet">Google Meet</MenuItem>
                    <MenuItem value="skype">Skype</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location/Link"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ fontWeight: 500 }}>Duration</InputLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    label="Duration"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea'
                        }
                      }
                    }}
                  >
                    <MenuItem value="15">15 minutes</MenuItem>
                    <MenuItem value="30">30 minutes</MenuItem>
                    <MenuItem value="45">45 minutes</MenuItem>
                    <MenuItem value="60">1 hour</MenuItem>
                    <MenuItem value="90">1.5 hours</MenuItem>
                    <MenuItem value="120">2 hours</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Participants
                </Typography>
                <Paper sx={{ maxHeight: 200, overflow: 'auto', p: 2 }}>
                  <FormGroup>
                    {users.map((user) => (
                      <FormControlLabel
                        key={user.id}
                        control={
                          <Checkbox
                            checked={formData.selectedUsers.includes(user.id)}
                            onChange={() => handleUserSelect(user.id)}
                            sx={{
                              color: '#667eea',
                              '&.Mui-checked': {
                                color: '#667eea',
                              },
                            }}
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 32, 
                                height: 32, 
                                fontSize: '0.8rem',
                                mr: 1,
                                bgcolor: '#667eea'
                              }}
                            >
                              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.fullName || user.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        sx={{ 
                          alignItems: 'flex-start',
                          mb: 1,
                          '& .MuiFormControlLabel-label': {
                            width: '100%'
                          }
                        }}
                      />
                    ))}
                  </FormGroup>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '50px',
              padding: '8px 20px',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={selectedMeeting ? handleUpdateMeeting : handleSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
            disabled={saving}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '50px',
              padding: '8px 24px',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2, #667eea)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
              },
              '&.Mui-disabled': {
                background: 'rgba(0, 0, 0, 0.12)'
              }
            }}
          >
            {saving ? 'Saving...' : (selectedMeeting ? 'Update Meeting' : 'Schedule Meeting')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Meeting Detail Dialog */}
      <Dialog
        open={meetingDetailDialogOpen}
        onClose={handleCloseMeetingDetail}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)', 
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VideoCallIcon sx={{ mr: 1 }} />
              Meeting Details
            </Box>
            {selectedMeeting && (
              <Chip
                icon={getPlatformIcon(selectedMeeting.platform)}
                label={selectedMeeting.platform || 'zoom'}
                size="small"
                sx={{ 
                  fontWeight: 600,
                  borderRadius: '20px',
                  bgcolor: `${getPlatformColor(selectedMeeting.platform)}20`,
                  color: getPlatformColor(selectedMeeting.platform),
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedMeeting && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      wordBreak: 'break-word',
                      color: '#333'
                    }}
                  >
                    {selectedMeeting.subject || 'No Subject'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <CalendarIcon sx={{ fontSize: 24, mr: 2, color: '#667eea' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        Date
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                        {selectedMeeting.date ? new Date(selectedMeeting.date).toLocaleDateString() : 'No Date'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon sx={{ fontSize: 24, mr: 2, color: '#667eea' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        Time & Duration
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                        {selectedMeeting.time || 'No Time'} ({getDurationLabel(selectedMeeting.duration)})
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <LocationOnIcon sx={{ fontSize: 24, mr: 2, color: '#667eea' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        Location
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                        {selectedMeeting.location || 'No Location'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Creator Information */}
                  {selectedMeeting.creator && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <PersonIcon sx={{ fontSize: 24, mr: 2, color: '#667eea', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          Created by:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                          {selectedMeeting.creator.fullName || selectedMeeting.creator.username}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                    Participants
                  </Typography>
                  {selectedMeeting.users && selectedMeeting.users.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedMeeting.users.map((user) => (
                        <Grid item xs={12} sm={6} md={4} key={user.id}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'rgba(102, 126, 234, 0.05)',
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                          }}>
                            <Avatar 
                              sx={{ 
                                width: 40, 
                                height: 40, 
                                fontSize: '1rem',
                                mr: 2,
                                bgcolor: '#667eea'
                              }}
                            >
                              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {user.fullName || user.username}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No participants selected
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      textAlign: 'right', 
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    Created: 
                    {selectedMeeting.createdAt ? 
                      new Date(selectedMeeting.createdAt).toLocaleString() : 
                      'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseMeetingDetail}
            sx={{
              borderRadius: '50px',
              padding: '8px 24px',
              fontWeight: 600
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingEngagement;