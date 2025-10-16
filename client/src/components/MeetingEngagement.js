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
  DialogActions
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
  Person as PersonIcon
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

  const sendMeetingNotifications = (meeting) => {
    // Notification is now handled by the backend service
    // No need to send from frontend
    
    // Set up reminder notification 15 minutes before meeting
    if (meeting.date && meeting.time) {
      const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
      const reminderTime = new Date(meetingDateTime.getTime() - 15 * 60000); // 15 minutes before
      
      // In a real implementation, you would use a scheduling service
      const now = new Date();
      if (reminderTime > now) {
        const delay = reminderTime.getTime() - now.getTime();
        setTimeout(() => {
          if (meeting.users && Array.isArray(meeting.users)) {
            meeting.users.forEach(selectedUser => {
              showSnackbar(`Reminder: Meeting "${meeting.subject}" starts in 15 minutes`, 'info');
            });
          }
        }, delay);
      }
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form when closing dialog
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

  const handleEditMeeting = (meeting) => {
    // Set form data with meeting details
    setFormData({
      subject: meeting.subject || '',
      platform: meeting.platform || 'zoom',
      location: meeting.location || '',
      date: meeting.date || '',
      time: meeting.time || '',
      duration: meeting.duration ? meeting.duration.toString() : '30',
      selectedUsers: meeting.selectedUserIds || meeting.selectedUsers || []
    });
    
    // Open dialog in edit mode
    setOpenDialog(true);
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await meetingAPI.deleteMeeting(meetingId);
      showSnackbar('Meeting deleted successfully!', 'success');
      // Remove from meetings list
      setMeetings(prev => prev.filter(meeting => meeting.id !== meetingId));
      // Meeting list will be updated via real-time notifications
    } catch (error) {
      console.error('Error deleting meeting:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete meeting';
      showSnackbar(errorMessage, 'error');
    }
  };

  const getMeetingStatus = (meeting) => {
    if (!meeting.date || !meeting.time) return 'Unknown';
    
    const now = new Date();
    const meetingDate = new Date(`${meeting.date}T${meeting.time}`);
    
    if (isNaN(meetingDate.getTime())) return 'Unknown';
    
    const meetingEnd = new Date(meetingDate.getTime() + (meeting.duration || 30) * 60000);
    
    if (meetingDate > now) {
      return 'Upcoming';
    } else if (meetingEnd > now) {
      return 'Ongoing';
    } else {
      return 'Ended';
    }
  };

  const getMeetingStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'primary';
      case 'Ongoing': return 'success';
      case 'Ended': return 'default';
      default: return 'default';
    }
  };

  // Ensure we have a user before rendering
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
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
          Meeting Engagement
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Schedule and manage meetings with team members
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Meeting Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Schedule New Meeting
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Create Meeting
              </Button>
            </Box>
            
            {/* Meeting List */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Upcoming Meetings
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : meetings && meetings.length > 0 ? (
              <Grid container spacing={2}>
                {meetings.map((meeting) => (
                  <Grid item xs={12} md={6} lg={4} key={meeting.id || meeting._id || Math.random()}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                      onClick={() => handleOpenMeetingDetail(meeting)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.2rem' }}>
                          {meeting.subject || 'No Subject'}
                        </Typography>
                        <Chip 
                          label={getMeetingStatus(meeting)} 
                          size="small"
                          color={getMeetingStatusColor(getMeetingStatus(meeting))}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <VideoCallIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {meeting.platform || 'zoom'}
                        </Typography>
                      </Box>
                      
                      {meeting.date && meeting.time && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {meeting.date} at {meeting.time} ({meeting.duration || 30} min)
                          </Typography>
                        </Box>
                      )}
                      
                      {meeting.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {meeting.location}
                          </Typography>
                        </Box>
                      )}
                      
                      {meeting.users && meeting.users.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Attendees:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {meeting.users.map((attendee) => (
                              <Chip
                                key={attendee.id || attendee._id || attendee.username}
                                label={attendee.fullName || attendee.username || 'Unknown User'}
                                size="small"
                                sx={{ 
                                  bgcolor: '#667eea20',
                                  color: '#667eea',
                                  fontWeight: 600
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleEditMeeting(meeting)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteMeeting(meeting.id || meeting._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  No upcoming meetings
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Schedule your first meeting using the "Create Meeting" button
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Create Meeting Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VideoCallIcon sx={{ mr: 1, color: 'primary.main' }} />
            Create New Meeting
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Meeting Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    name="platform"
                    value={formData.platform}
                    onChange={handleInputChange}
                    label="Platform"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  >
                    <MenuItem value="zoom">Zoom</MenuItem>
                    <MenuItem value="meet">Google Meet</MenuItem>
                    <MenuItem value="physical">Physical Meeting</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={formData.platform === 'physical' ? "Meeting Location" : "Invitation Link"}
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  placeholder={formData.platform === 'physical' ? "Enter meeting location" : "Enter invitation link"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Meeting Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Meeting Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Duration (minutes)</InputLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    label="Duration (minutes)"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
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
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Select Attendees
                </Typography>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : users && users.length > 0 ? (
                  <Paper sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                    <Grid container spacing={1}>
                      {users.map((usr) => (
                        <Grid item xs={12} sm={6} md={4} key={usr.id || usr._id}>
                          <Paper 
                            elevation={formData.selectedUsers.includes(usr.id) ? 4 : 1}
                            sx={{
                              p: 1,
                              cursor: 'pointer',
                              backgroundColor: formData.selectedUsers.includes(usr.id) 
                                ? 'primary.light' 
                                : 'background.paper',
                              border: formData.selectedUsers.includes(usr.id) 
                                ? '2px solid' 
                                : '1px solid',
                              borderColor: formData.selectedUsers.includes(usr.id) 
                                ? 'primary.main' 
                                : 'divider',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                                transform: 'scale(1.02)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                            onClick={() => handleUserSelect(usr.id)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                checked={formData.selectedUsers.includes(usr.id)}
                                onChange={() => handleUserSelect(usr.id)}
                                color="primary"
                                size="small"
                              />
                              <Box sx={{ ml: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {usr.fullName || usr.username || 'Unknown User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {usr.username || 'No username'}
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No users available
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
            sx={{ 
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2, #667eea)'
              }
            }}
          >
            {saving ? 'Saving...' : 'Save Meeting'}
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
          sx={{ width: '100%' }}
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
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <VideoCallIcon sx={{ mr: 1, color: 'primary.main' }} />
              Meeting Details
            </Box>
            <Chip 
              label={selectedMeeting ? getMeetingStatus(selectedMeeting) : ''} 
              size="small"
              color={selectedMeeting ? getMeetingStatusColor(getMeetingStatus(selectedMeeting)) : 'default'}
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedMeeting && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 2, fontSize: '1.5rem' }}>
                    {selectedMeeting.subject || 'No Subject'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <VideoCallIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Platform: 
                      <Typography component="span" sx={{ fontWeight: 400, ml: 1 }}>
                        {selectedMeeting.platform || 'zoom'}
                      </Typography>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Date & Time: 
                      <Typography component="span" sx={{ fontWeight: 400, ml: 1 }}>
                        {selectedMeeting.date && selectedMeeting.time 
                          ? `${selectedMeeting.date} at ${selectedMeeting.time}` 
                          : 'Not specified'}
                      </Typography>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      Duration: 
                      <Typography component="span" sx={{ fontWeight: 400, ml: 1 }}>
                        {selectedMeeting.duration || 30} minutes
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {selectedMeeting.location && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <LocationOnIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedMeeting.platform === 'physical' ? 'Location' : 'Link'}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5 }}>
                          {selectedMeeting.location}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <PersonIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Created by:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5 }}>
                        {selectedMeeting.creator?.fullName || selectedMeeting.creator?.username || 'Unknown User'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {(selectedMeeting.selectedUsers || selectedMeeting.users) && (selectedMeeting.selectedUsers || selectedMeeting.users).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Attendees ({(selectedMeeting.selectedUsers || selectedMeeting.users).length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(selectedMeeting.selectedUsers || selectedMeeting.users).map((attendee) => (
                        <Chip
                          key={attendee.id || attendee._id || attendee.username}
                          label={attendee.fullName || attendee.username || attendee.name || 'Unknown User'}
                          sx={{ 
                            bgcolor: '#667eea20',
                            color: '#667eea',
                            fontWeight: 600
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right', mt: 2 }}>
                    Created: {new Date(selectedMeeting.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMeetingDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeetingEngagement;