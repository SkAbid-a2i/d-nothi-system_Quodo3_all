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
  VideoCall as VideoCallIcon
} from '@mui/icons-material';
import { userAPI } from '../services/api';
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
  
  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    // In a real implementation, you would also fetch existing meetings
    // fetchMeetings();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
      showSnackbar('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
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
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        // In a real implementation, you would send this to the backend
      };

      // Add to meetings list (simulating API call)
      const newMeeting = {
        id: meetings.length + 1,
        ...meetingData,
        users: users.filter(u => formData.selectedUsers.includes(u.id))
      };

      setMeetings([newMeeting, ...meetings]);
      
      // Send notifications to selected users
      sendMeetingNotifications(newMeeting);
      
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
    } catch (error) {
      console.error('Error creating meeting:', error);
      setError('Failed to create meeting: ' + (error.response?.data?.message || error.message));
      showSnackbar('Failed to create meeting', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendMeetingNotifications = (meeting) => {
    // Send notification to each selected user
    meeting.users.forEach(selectedUser => {
      // In a real implementation, this would be sent via the notification service
      console.log(`Notification sent to ${selectedUser.username} for meeting: ${meeting.subject}`);
      
      // Simulate notification
      showSnackbar(`Meeting notification sent to ${selectedUser.username}`, 'info');
    });
    
    // Set up reminder notification 15 minutes before meeting
    const meetingDateTime = new Date(`${meeting.date}T${meeting.time}`);
    const reminderTime = new Date(meetingDateTime.getTime() - 15 * 60000); // 15 minutes before
    
    // In a real implementation, you would use a scheduling service
    const now = new Date();
    if (reminderTime > now) {
      const delay = reminderTime.getTime() - now.getTime();
      setTimeout(() => {
        meeting.users.forEach(selectedUser => {
          showSnackbar(`Reminder: Meeting "${meeting.subject}" starts in 15 minutes`, 'info');
        });
      }, delay);
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
            
            {meetings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  No upcoming meetings
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Schedule your first meeting using the "Create Meeting" button
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {meetings.map((meeting) => (
                  <Grid item xs={12} md={6} lg={4} key={meeting.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                        {meeting.subject}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <VideoCallIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {meeting.platform}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {meeting.date} at {meeting.time} ({meeting.duration} min)
                        </Typography>
                      </Box>
                      
                      {meeting.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {meeting.location}
                          </Typography>
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                          Attendees:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {meeting.users.map((attendee) => (
                            <Chip
                              key={attendee.id}
                              label={attendee.username}
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
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Create Meeting Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
                ) : (
                  <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                    {users.map((usr) => (
                      <FormControlLabel
                        key={usr.id}
                        control={
                          <Checkbox
                            checked={formData.selectedUsers.includes(usr.id)}
                            onChange={() => handleUserSelect(usr.id)}
                            color="primary"
                          />
                        }
                        label={usr.fullName || usr.username}
                        sx={{ width: '50%', minWidth: 200, mb: 1 }}
                      />
                    ))}
                  </FormGroup>
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
    </Box>
  );
};

export default MeetingEngagement;