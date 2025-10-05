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
  Snackbar,
  CircularProgress
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
import ModernLeaveManagement from './ModernLeaveManagement';

const LeaveManagement = () => {
  // For now, we'll use the modern leave management
  // You can switch back to the original component if needed
  return <ModernLeaveManagement />;
  
  // Original implementation (commented out for now)
  /*
  const { user } = useAuth();
  const { t } = useTranslation();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [dialogs, setDialogs] = useState({
    approve: { open: false, leave: null },
    reject: { open: false, leave: null },
    edit: { open: false, leave: null },
    delete: { open: false, leave: null }
  });
  
  // Form state
  const [formState, setFormState] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  // Main form state (separate from edit form)
  const [mainFormState, setMainFormState] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  
  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const openDialog = (dialogType, leave = null) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: true, leave }
    }));
  };

  const closeDialog = (dialogType) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: false, leave: null }
    }));
  };
  
  // Force close dialog to ensure it closes even if there are state issues
  const forceCloseDialog = (dialogType) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: false, leave: null }
    }));
    // Add a small delay and then force close again to ensure it's closed
    setTimeout(() => {
      setDialogs(prev => ({
        ...prev,
        [dialogType]: { open: false, leave: null }
      }));
    }, 100);
  };

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching leaves...');
      const response = await leaveAPI.getAllLeaves();
      console.log('Leaves response:', response);
      // Ensure we're setting an array - API might return an object with data property
      const leavesData = Array.isArray(response.data) ? response.data : 
                        response.data?.data || response.data || [];
      setLeaves(leavesData);
      
      // Log audit entry
      if (user) {
        auditLog.leaveFetched(leavesData.length, user.username || 'unknown');
      }
      console.log('Leaves fetched successfully, count:', leavesData.length);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch leave requests. Please try again.';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showSnackbar]);
  
  // Fetch leaves on component mount
  useEffect(() => {
    console.log('LeaveManagement component mounted, fetching leaves...');
    fetchLeaves();
  }, [fetchLeaves]);
  
  // Debug dialog states
  useEffect(() => {
    console.log('Dialog states updated:', dialogs);
  }, [dialogs]);
  
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
      showSnackbar(`Leave Request approved!`, 'success');
      // Refresh leave list
      fetchLeaves();
    };

    const handleLeaveRejected = (data) => {
      frontendLogger.info('Real-time leave rejected notification received', data);
      showSnackbar(`Leave Request rejected!`, 'warning');
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
    
    const calendarData = [];
    for (let i = 0; i < 42; i++) {
      const day = i - firstDay + 1;
      const isCurrentMonth = day > 0 && day <= daysInMonth;
      const date = isCurrentMonth 
        ? new Date(today.getFullYear(), today.getMonth(), day)
        : day <= 0 
          ? new Date(today.getFullYear(), today.getMonth() - 1, daysInMonth + day)
          : new Date(today.getFullYear(), today.getMonth() + 1, day - daysInMonth);
      
      calendarData.push({
        day,
        date: date.toISOString().split('T')[0],
        isCurrentMonth,
        isToday: date.toDateString() === today.toDateString(),
        leaves: leaves.filter(leave => {
          const leaveDate = new Date(leave.startDate);
          return leaveDate.toDateString() === date.toDateString() && leave.status === 'Approved';
        }).length
      });
    }
    
    return calendarData;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!mainFormState.startDate || !mainFormState.endDate || !mainFormState.reason) {
      showSnackbar(t('leaves.pleaseFillAllFields'), 'error');
      return;
    }
    
    // Date validation
    const startDate = new Date(mainFormState.startDate);
    const endDate = new Date(mainFormState.endDate);
    
    if (startDate > endDate) {
      showSnackbar(t('leaves.endDateAfterStartDate'), 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      const leaveData = {
        startDate: mainFormState.startDate,
        endDate: mainFormState.endDate,
        reason: mainFormState.reason
      };
      
      await leaveAPI.createLeave(leaveData);
      
      // Reset form
      setMainFormState({
        startDate: '',
        endDate: '',
        reason: ''
      });
      
      showSnackbar(t('leaves.leaveRequestSubmitted'), 'success');
      
      // Refresh leaves
      fetchLeaves();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      showSnackbar(t('leaves.errorSubmittingRequest') + ': ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approveLeave(leaveId);
      showSnackbar('Leave request approved successfully!', 'success');
      fetchLeaves(); // Refresh data
      closeDialog('approve');
    } catch (error) {
      console.error('Error approving leave:', error);
      showSnackbar('Error approving leave: ' + error.message, 'error');
    }
  };
  
  const handleRejectLeave = async (leaveId, rejectionReason) => {
    try {
      await leaveAPI.rejectLeave(leaveId, { rejectionReason });
      showSnackbar('Leave request rejected successfully!', 'success');
      fetchLeaves(); // Refresh data
      closeDialog('reject');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      showSnackbar('Error rejecting leave: ' + error.message, 'error');
    }
  };
  
  // Filter leaves based on search and status
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = !searchTerm || 
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('leaves.requestNewLeave')}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('leaves.startDate')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={mainFormState.startDate}
                    onChange={(e) => handleMainFormChange('startDate', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('leaves.endDate')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={mainFormState.endDate}
                    onChange={(e) => handleMainFormChange('endDate', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('leaves.reason')}
                    multiline
                    rows={3}
                    value={mainFormState.reason}
                    onChange={(e) => handleMainFormChange('reason', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<AddIcon />} type="submit">
                    Submit Leave Request
                  </Button>
                </Grid>
              </Grid>
            </form>
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
                <Button variant="outlined" onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}>
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
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditLeave(leave)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteLeave(leave)}
                      >
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
        open={dialogs.approve.open} 
        onClose={() => {
          console.log('Approve dialog closing');
          forceCloseDialog('approve');
        }}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">{t('common.approve')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {dialogs.approve.leave && `Are you sure you want to approve the leave request for ${dialogs.approve.leave.userName || dialogs.approve.leave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            console.log('Cancel approve clicked');
            forceCloseDialog('approve');
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
        open={dialogs.reject.open} 
        onClose={() => {
          console.log('Reject dialog closing');
          forceCloseDialog('reject');
        }}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">{t('common.reject')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {dialogs.reject.leave && `Are you sure you want to reject the leave request for ${dialogs.reject.leave.userName || dialogs.reject.leave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            console.log('Cancel reject clicked');
            forceCloseDialog('reject');
          }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmReject} variant="contained" color="error">
            {t('common.reject')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog 
        open={dialogs.edit.open} 
        onClose={() => {
          closeDialog('edit');
          resetForm();
        }}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">{t('common.edit')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('leaves.startDate')}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formState.startDate}
                onChange={(e) => handleFormChange('startDate', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('leaves.endDate')}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formState.endDate}
                onChange={(e) => handleFormChange('endDate', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('leaves.reason')}
                multiline
                rows={3}
                value={formState.reason}
                onChange={(e) => handleFormChange('reason', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            closeDialog('edit');
            resetForm();
          }}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmEditLeave} variant="contained" color="primary">
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog 
        open={dialogs.delete.open} 
        onClose={() => closeDialog('delete')}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">{t('common.delete')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {dialogs.delete.leave && `Are you sure you want to delete the leave request for ${dialogs.delete.leave.userName || dialogs.delete.leave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('delete')}>
            {t('common.cancel')}
          </Button>
          <Button onClick={confirmDeleteLeave} variant="contained" color="error">
            {t('common.delete')}
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