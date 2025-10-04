import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Snackbar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { leaveAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';
import notificationService from '../services/notificationService';
import frontendLogger from '../services/frontendLogger';

const LeaveManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await leaveAPI.getAllLeaves();
      setLeaves(response.data || []);
      
      // Log audit entry
      if (user) {
        auditLog.leaveFetched((response.data || []).length, user.username || 'unknown');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch leave requests. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showSnackbar]);
  
  // Fetch leaves on component mount
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  
  // Listen for real-time notifications
  useEffect(() => {
    const handleLeaveRequested = (data) => {
      frontendLogger.info('Real-time leave requested notification received', data);
      showSnackbar(`New leave request from ${data.leave.userName}`, 'info');
      // Refresh leave list
      fetchLeaves();
    };

    const handleLeaveApproved = (data) => {
      frontendLogger.info('Real-time leave approved notification received', data);
      showSnackbar(`Leave request has been approved`, 'success');
      // Refresh leave list
      fetchLeaves();
    };

    const handleLeaveRejected = (data) => {
      frontendLogger.info('Real-time leave rejected notification received', data);
      showSnackbar(`Leave request has been rejected`, 'warning');
      // Refresh leave list
      fetchLeaves();
    };

    // Subscribe to notifications
    notificationService.onLeaveRequested(handleLeaveRequested);
    notificationService.onLeaveApproved(handleLeaveApproved);
    notificationService.onLeaveRejected(handleLeaveRejected);

    // Cleanup on unmount
    return () => {
      notificationService.off('leaveRequested', handleLeaveRequested);
      notificationService.off('leaveApproved', handleLeaveApproved);
      notificationService.off('leaveRejected', handleLeaveRejected);
    };
  }, [fetchLeaves, showSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Mock calendar data for demonstration
  const getCalendarData = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
    
    const weeks = [];
    let week = Array(7).fill(null);
    
    // Fill in the days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayOfWeek = (firstDay + day - 1) % 7;
      week[dayOfWeek] = day;
      
      if (dayOfWeek === 6 || day === daysInMonth) {
        weeks.push([...week]);
        week = Array(7).fill(null);
      }
    }
    
    return weeks;
  };
  
  const calendarData = getCalendarData();
  
  // Mock notifications data
  const notifications = [
    { id: 1, message: 'John Doe has requested leave for Oct 1-3', time: '2 hours ago', type: 'leave' },
    { id: 2, message: 'Jane Smith\'s leave request approved', time: '1 day ago', type: 'approval' },
    { id: 3, message: 'Reminder: Team meeting tomorrow', time: '1 day ago', type: 'reminder' }
  ];

  // Filter leaves based on search term and status
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = !searchTerm || 
      (leave.employee && leave.employee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApproveLeave = (leave) => {
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setSelectedLeave(leave);
    setOpenApproveDialog(true);
  };

  const handleRejectLeave = (leave) => {
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setSelectedLeave(leave);
    setOpenRejectDialog(true);
  };

  const confirmApprove = async () => {
    try {
      // Check if selectedLeave is not null before proceeding
      if (!selectedLeave || !selectedLeave.id) {
        console.error('Error: selectedLeave is null or missing id');
        setError('Cannot approve leave: Invalid leave selection');
        showSnackbar('Cannot approve leave: Invalid leave selection', 'error');
        // Make sure dialog closes even on error
        setOpenApproveDialog(false);
        setSelectedLeave(null);
        return;
      }
      
      await leaveAPI.approveLeave(selectedLeave.id);
      
      // Update leave status to approved
      setLeaves(leaves.map(leave => 
        leave.id === selectedLeave.id 
          ? { ...leave, status: 'Approved' } 
          : leave
      ));
      
      // Log audit entry
      if (user) {
        auditLog.leaveApproved(selectedLeave.id, user.username || 'unknown');
      }
      
      // Close dialog first
      setOpenApproveDialog(false);
      setSelectedLeave(null);
      
      // Show success notification
      showSnackbar(`Leave request for ${selectedLeave.userName || selectedLeave.employee} has been approved!`, 'success');
      
      // Refresh leave list to ensure UI is updated
      setTimeout(() => {
        fetchLeaves();
      }, 1000);
    } catch (error) {
      console.error('Error approving leave:', error);
      const errorMessage = 'Failed to approve leave request: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      // Make sure dialog closes even on error
      setOpenApproveDialog(false);
      setSelectedLeave(null);
    }
  };

  const confirmReject = async () => {
    try {
      // Check if selectedLeave is not null before proceeding
      if (!selectedLeave || !selectedLeave.id) {
        console.error('Error: selectedLeave is null or missing id');
        setError('Cannot reject leave: Invalid leave selection');
        showSnackbar('Cannot reject leave: Invalid leave selection', 'error');
        // Make sure dialog closes even on error
        setOpenRejectDialog(false);
        setSelectedLeave(null);
        return;
      }
      
      // Include rejection reason in the request
      await leaveAPI.rejectLeave(selectedLeave.id, { rejectionReason: 'Rejected by admin' });
      
      // Update leave status to rejected
      setLeaves(leaves.map(leave => 
        leave.id === selectedLeave.id 
          ? { ...leave, status: 'Rejected' } 
          : leave
      ));
      
      // Log audit entry
      if (user) {
        auditLog.leaveRejected(selectedLeave.id, user.username || 'unknown', 'Rejected by admin');
      }
      
      // Close dialog first
      setOpenRejectDialog(false);
      setSelectedLeave(null);
      
      // Show success notification
      showSnackbar(`Leave request for ${selectedLeave.userName || selectedLeave.employee} has been rejected!`, 'warning');
      
      // Refresh leave list to ensure UI is updated
      setTimeout(() => {
        fetchLeaves();
      }, 1000);
    } catch (error) {
      console.error('Error rejecting leave:', error);
      const errorMessage = 'Failed to reject leave request: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      // Make sure dialog closes even on error
      setOpenRejectDialog(false);
      setSelectedLeave(null);
    }
  };
  
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const leaveData = {
        startDate,
        endDate,
        reason,
        appliedDate: new Date().toISOString().split('T')[0]
      };
      
      const response = await leaveAPI.createLeave(leaveData);
      
      // Add new leave to list
      const newLeave = {
        id: response.data.id,
        employee: user?.fullName || user?.username || 'Current User',
        ...leaveData,
        status: 'Pending'
      };
      setLeaves([...leaves, newLeave]);
      
      // Log audit entry
      if (user) {
        auditLog.leaveCreated(response.data.id, user.username || 'unknown');
      }
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      
      // Show success notification
      showSnackbar(`Leave request for ${newLeave.startDate} to ${newLeave.endDate} submitted successfully!`, 'success');
    } catch (error) {
      console.error('Error submitting leave:', error);
      setError('Failed to submit leave request: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('leaves.title')}
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('leaves.leaveRequests')} icon={<SearchIcon />} />
          <Tab label={t('leaves.calendar')} icon={<CalendarIcon />} />
          <Tab label={t('leaves.notifications')} icon={<NotificationsIcon />} />
        </Tabs>
      </Paper>
      
      {activeTab === 0 && (
        <>
          {/* Leave Request Form */}
          {loading && (
            <Typography>Loading leave requests...</Typography>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('leaves.requestNewLeave')}
            </Typography>
            <Grid container spacing={2} component="form" onSubmit={handleSubmitLeave}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('leaves.startDate')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('leaves.endDate')}
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('leaves.reason')}
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<AddIcon />} type="submit">
                  Submit Leave Request
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Leave Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: <SearchIcon />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>{t('tasks.status')}</InputLabel>
                  <Select 
                    label="Status" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button variant="outlined" sx={{ mr: 1 }}>
                  Filter
                </Button>
                <Button variant="outlined">
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Leave List */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Applied Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.employee || leave.userName || 'N/A'}</TableCell>
                    <TableCell>{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>{leave.reason || 'N/A'}</TableCell>
                    <TableCell>{leave.appliedDate ? new Date(leave.appliedDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status || 'Pending'} 
                        color={
                          leave.status === 'Approved' ? 'success' : 
                          leave.status === 'Rejected' ? 'error' : 'warning'
                        } 
                      />
                    </TableCell>
                    <TableCell>
                      {leave.status === 'Pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleApproveLeave(leave)}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleRejectLeave(leave)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      
      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Leave Calendar
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', maxWidth: 800 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Button variant="outlined">Previous</Button>
                <Typography variant="h6">October 2025</Typography>
                <Button variant="outlined">Next</Button>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Sun</TableCell>
                    <TableCell align="center">Mon</TableCell>
                    <TableCell align="center">Tue</TableCell>
                    <TableCell align="center">Wed</TableCell>
                    <TableCell align="center">Thu</TableCell>
                    <TableCell align="center">Fri</TableCell>
                    <TableCell align="center">Sat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calendarData.map((week, weekIndex) => (
                    <TableRow key={weekIndex}>
                      {week.map((day, dayIndex) => (
                        <TableCell 
                          key={dayIndex} 
                          align="center" 
                          sx={{ 
                            height: 100, 
                            verticalAlign: 'top',
                            position: 'relative',
                            bgcolor: day === 1 || day === 2 || day === 3 ? 'primary.light' : 'transparent'
                          }}
                        >
                          {day && (
                            <>
                              <Typography variant="body2">{day}</Typography>
                              {day === 1 && (
                                <Box sx={{ 
                                  position: 'absolute', 
                                  bottom: 2, 
                                  left: 2, 
                                  right: 2, 
                                  bgcolor: 'success.main', 
                                  color: 'white', 
                                  fontSize: '0.7rem', 
                                  p: 0.5, 
                                  borderRadius: 1 
                                }}>
                                  John: Leave
                                </Box>
                              )}
                              {day === 2 && (
                                <Box sx={{ 
                                  position: 'absolute', 
                                  bottom: 2, 
                                  left: 2, 
                                  right: 2, 
                                  bgcolor: 'success.main', 
                                  color: 'white', 
                                  fontSize: '0.7rem', 
                                  p: 0.5, 
                                  borderRadius: 1 
                                }}>
                                  John: Leave
                                </Box>
                              )}
                              {day === 3 && (
                                <Box sx={{ 
                                  position: 'absolute', 
                                  bottom: 2, 
                                  left: 2, 
                                  right: 2, 
                                  bgcolor: 'success.main', 
                                  color: 'white', 
                                  fontSize: '0.7rem', 
                                  p: 0.5, 
                                  borderRadius: 1 
                                }}>
                                  John: Leave
                                </Box>
                              )}
                            </>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        </Paper>
      )}
      
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Notification</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.message}</TableCell>
                    <TableCell>{notification.time}</TableCell>
                    <TableCell>
                      <Chip 
                        label={notification.type} 
                        size="small" 
                        color={
                          notification.type === 'leave' ? 'primary' : 
                          notification.type === 'approval' ? 'success' : 'default'
                        } 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {/* Approve Dialog */}
      <Dialog 
        open={openApproveDialog} 
        onClose={() => {
          setOpenApproveDialog(false);
          setSelectedLeave(null);
        }}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">{t('common.approve')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedLeave && `Are you sure you want to approve the leave request for ${selectedLeave.userName || selectedLeave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenApproveDialog(false);
            setSelectedLeave(null);
          }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmApprove} variant="contained" color="success">
            {t('common.approve')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog 
        open={openRejectDialog} 
        onClose={() => {
          setOpenRejectDialog(false);
          setSelectedLeave(null);
        }}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">{t('common.reject')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {selectedLeave && `Are you sure you want to reject the leave request for ${selectedLeave.userName || selectedLeave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenRejectDialog(false);
            setSelectedLeave(null);
          }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmReject} variant="contained" color="error">
            {t('common.reject')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for real-time notifications */}
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

export default LeaveManagement;