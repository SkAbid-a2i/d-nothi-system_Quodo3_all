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
  CircularProgress,
  Fade,
  Zoom
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  EventAvailable
} from '@mui/icons-material';
import { useTranslation } from '../contexts/TranslationContext';
import { leaveAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';
import frontendLogger from '../services/frontendLogger';

const ModernLeaveManagement = () => {
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

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await leaveAPI.getAllLeaves();
      let leavesData = response.data || [];
      
      // Filter leaves based on user role
      if (user && user.role === 'Agent') {
        // Agents only see their own leaves
        leavesData = leavesData.filter(leave => 
          leave.userId === user.id || leave.userName === user.username
        );
      } else if (user && (user.role === 'Admin' || user.role === 'Supervisor')) {
        // Admins and Supervisors see leaves from their office
        leavesData = leavesData.filter(leave => 
          leave.office === user.office
        );
      } else if (user && user.role === 'SystemAdmin') {
        // SystemAdmin sees all leaves (no filtering needed)
        // leavesData remains unchanged
      }
      
      setLeaves(leavesData);
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
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('ModernLeaveManagement', 'leaves', fetchLeaves, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('ModernLeaveManagement');
    };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!mainFormState.startDate || !mainFormState.endDate || !mainFormState.reason) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const leaveData = {
        startDate: mainFormState.startDate,
        endDate: mainFormState.endDate,
        reason: mainFormState.reason,
        appliedDate: new Date().toISOString().split('T')[0],
        userId: user.id,
        userName: user.username || user.fullName,
        office: user.office
      };
      
      const response = await leaveAPI.createLeave(leaveData);
      
      // Add new leave to list
      const newLeave = {
        id: response.data.id,
        employee: user?.fullName || user?.username || 'Current User',
        ...leaveData,
        status: 'Pending'
      };
      setLeaves([newLeave, ...leaves]);
      
      setMainFormState({
        startDate: '',
        endDate: '',
        reason: ''
      });
      
      showSnackbar('Leave request submitted successfully!', 'success');
    } catch (error) {
      const errorMessage = 'Error submitting leave request: ' + (error.response?.data?.message || error.message);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      await leaveAPI.approveLeave(leaveId);
      
      // Update leave status to approved
      setLeaves(leaves.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'Approved' } 
          : leave
      ));
      
      showSnackbar('Leave request approved successfully!', 'success');
      closeDialog('approve');
      
      // Refresh leave list
      fetchLeaves();
    } catch (error) {
      const errorMessage = 'Error approving leave request: ' + (error.response?.data?.message || error.message);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await leaveAPI.rejectLeave(leaveId, { rejectionReason: 'Rejected by admin' });
      
      // Update leave status to rejected
      setLeaves(leaves.map(leave => 
        leave.id === leaveId 
          ? { ...leave, status: 'Rejected' } 
          : leave
      ));
      
      showSnackbar('Leave request rejected successfully!', 'warning');
      closeDialog('reject');
      
      // Refresh leave list
      fetchLeaves();
    } catch (error) {
      const errorMessage = 'Error rejecting leave request: ' + (error.response?.data?.message || error.message);
      showSnackbar(errorMessage, 'error');
    }
  };

  // Filter leaves based on search term and status
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = !searchTerm || 
      (leave.employee && leave.employee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.userName && leave.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Generate calendar data for the current month
  const getCalendarData = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Create array to hold all days
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(day);
    }
    
    // Group into weeks (7 days per week)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };
  
  // Get leave data for calendar display
  const getLeaveCalendarData = () => {
    const calendarData = getCalendarData();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create a map of leave dates
    const leaveMap = {};
    leaves.forEach(leave => {
      if (leave.startDate && leave.endDate) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        
        // Only include leaves for current month
        if (start.getFullYear() === currentYear && start.getMonth() === currentMonth) {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getMonth() === currentMonth) {
              const dateKey = d.getDate();
              if (!leaveMap[dateKey]) {
                leaveMap[dateKey] = [];
              }
              leaveMap[dateKey].push({
                userName: leave.userName || leave.employee,
                status: leave.status
              });
            }
          }
        }
      }
    });
    
    return { calendarData, leaveMap };
  };
  
  const { calendarData, leaveMap } = getLeaveCalendarData();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('leaves.title')}
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={t('leaves.leaveRequests')} icon={<SearchIcon />} iconPosition="start" />
          <Tab label={t('leaves.calendar')} icon={<CalendarIcon />} iconPosition="start" />
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
                    onChange={(e) => setMainFormState({ ...mainFormState, startDate: e.target.value })}
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
                    onChange={(e) => setMainFormState({ ...mainFormState, endDate: e.target.value })}
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
                    onChange={(e) => setMainFormState({ ...mainFormState, reason: e.target.value })}
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
                            onClick={() => openDialog('approve', leave)}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDialog('reject', leave)}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          setFormState({
                            startDate: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
                            endDate: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
                            reason: leave.reason || ''
                          });
                          openDialog('edit', leave);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => openDialog('delete', leave)}
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
                <Typography variant="h6">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Typography>
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
                            bgcolor: day ? 'transparent' : 'transparent'
                          }}
                        >
                          {day && (
                            <>
                              <Typography variant="body2">{day}</Typography>
                              {leaveMap[day] && leaveMap[day].map((leave, index) => (
                                <Box 
                                  key={index}
                                  sx={{ 
                                    position: 'absolute', 
                                    bottom: 2 + (index * 20), 
                                    left: 2, 
                                    right: 2, 
                                    bgcolor: leave.status === 'Approved' ? 'success.main' : 
                                            leave.status === 'Rejected' ? 'error.main' : 'warning.main', 
                                    color: 'white', 
                                    fontSize: '0.7rem', 
                                    p: 0.5, 
                                    borderRadius: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}
                                >
                                  {leave.userName}: {leave.status}
                                </Box>
                              ))}
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
      
      {/* Approve Dialog */}
      <Dialog 
        open={dialogs.approve.open} 
        onClose={() => closeDialog('approve')}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">{t('common.approve')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {dialogs.approve.leave && `Are you sure you want to approve the leave request for ${dialogs.approve.leave.userName || dialogs.approve.leave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('approve')}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={() => handleApproveLeave(dialogs.approve.leave.id)} 
            variant="contained" 
            color="success"
          >
            {t('common.approve')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog 
        open={dialogs.reject.open} 
        onClose={() => closeDialog('reject')}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">{t('common.reject')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {dialogs.reject.leave && `Are you sure you want to reject the leave request for ${dialogs.reject.leave.userName || dialogs.reject.leave.employee}?`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('reject')}>
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={() => handleRejectLeave(dialogs.reject.leave.id)} 
            variant="contained" 
            color="error"
          >
            {t('common.reject')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Dialog */}
      <Dialog 
        open={dialogs.edit.open} 
        onClose={() => {
          closeDialog('edit');
          setFormState({
            startDate: '',
            endDate: '',
            reason: ''
          });
        }}
        aria-labelledby="edit-dialog-title"
      >
        <DialogTitle id="edit-dialog-title">{t('common.edit')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('leaves.startDate')}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formState.startDate}
                onChange={(e) => setFormState({ ...formState, startDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('leaves.endDate')}
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formState.endDate}
                onChange={(e) => setFormState({ ...formState, endDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('leaves.reason')}
                multiline
                rows={3}
                value={formState.reason}
                onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              closeDialog('edit');
              setFormState({
                startDate: '',
                endDate: '',
                reason: ''
              });
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="contained" color="primary">
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
          <Button variant="contained" color="error">
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ModernLeaveManagement;