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
  styled
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
import autoRefreshService from '../services/autoRefreshService';

// Styled Tab component for better design
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightRegular,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  color: 'rgba(0, 0, 0, 0.7)',
  '&.Mui-selected': {
    color: '#667eea',
    fontWeight: theme.typography.fontWeightMedium,
  },
  '&.Mui-focusVisible': {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid #e8e8e8',
  '& .MuiTabs-indicator': {
    backgroundColor: '#667eea',
  },
}));

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
    autoRefreshService.subscribe('LeaveManagement', 'leaves', fetchLeaves, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('LeaveManagement');
    };
  }, [fetchLeaves]);
  
  // Get notifications for the current user based on their role
  const [userNotifications, setUserNotifications] = useState([]);

  // Fetch real notifications from backend or generate from current leaves
  const fetchUserNotifications = useCallback(() => {
    // Generate notifications from current leaves data
    const notifications = [];
    
    if (user) {
      if (user.role === 'Agent') {
        // Agents see their own leave notifications
        leaves.filter(l => l.userId === user.id || l.userName === user.username)
          .forEach(leave => {
            if (leave.status === 'Approved') {
              notifications.push({
                id: `approved-${leave.id}`,
                message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been approved`,
                time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
                type: 'approval'
              });
            } else if (leave.status === 'Rejected') {
              notifications.push({
                id: `rejected-${leave.id}`,
                message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} has been rejected`,
                time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
                type: 'rejection'
              });
            } else if (leave.status === 'Pending') {
              notifications.push({
                id: `requested-${leave.id}`,
                message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()} is pending approval`,
                time: leave.createdAt ? new Date(leave.createdAt).toLocaleString() : 'Recently',
                type: 'leave'
              });
            }
          });
      } else if (user.role === 'Admin' || user.role === 'Supervisor') {
        // Admins/Supervisors see notifications for their team
        leaves.filter(l => l.office === user.office)
          .forEach(leave => {
            if (leave.status === 'Pending') {
              notifications.push({
                id: `requested-${leave.id}`,
                message: `${leave.userName || leave.employee} has requested leave for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
                time: leave.createdAt ? new Date(leave.createdAt).toLocaleString() : 'Recently',
                type: 'leave'
              });
            } else if (leave.status === 'Approved') {
              notifications.push({
                id: `approved-${leave.id}`,
                message: `${leave.userName || leave.employee}'s leave request has been approved`,
                time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
                type: 'approval'
              });
            } else if (leave.status === 'Rejected') {
              notifications.push({
                id: `rejected-${leave.id}`,
                message: `${leave.userName || leave.employee}'s leave request has been rejected`,
                time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
                type: 'rejection'
              });
            }
          });
      } else if (user.role === 'SystemAdmin') {
        // SystemAdmin sees all notifications
        leaves.forEach(leave => {
          if (leave.status === 'Pending') {
            notifications.push({
              id: `requested-${leave.id}`,
              message: `${leave.userName || leave.employee} has requested leave for ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
              time: leave.createdAt ? new Date(leave.createdAt).toLocaleString() : 'Recently',
              type: 'leave'
            });
          } else if (leave.status === 'Approved') {
            notifications.push({
              id: `approved-${leave.id}`,
              message: `${leave.userName || leave.employee}'s leave request has been approved`,
              time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
              type: 'approval'
            });
          } else if (leave.status === 'Rejected') {
            notifications.push({
              id: `rejected-${leave.id}`,
              message: `${leave.userName || leave.employee}'s leave request has been rejected`,
              time: leave.updatedAt ? new Date(leave.updatedAt).toLocaleString() : 'Recently',
              type: 'rejection'
            });
          }
        });
      }
    }
    
    // Sort notifications by time (newest first)
    notifications.sort((a, b) => {
      const timeA = new Date(a.time);
      const timeB = new Date(b.time);
      return timeB - timeA;
    });
    
    setUserNotifications(notifications);
  }, [leaves, user]);

  // Fetch notifications when leaves or user changes
  useEffect(() => {
    fetchUserNotifications();
  }, [fetchUserNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleLeaveRequested = (data) => {
      frontendLogger.info('Real-time leave requested notification received', data);
      showSnackbar(`New leave request from ${data.leave.userName}`, 'info');
      // Refresh leave list and notifications
      fetchLeaves();
      fetchUserNotifications();
    };

    const handleLeaveApproved = (data) => {
      frontendLogger.info('Real-time leave approved notification received', data);
      showSnackbar(`Leave Request approved!`, 'success');
      // Refresh leave list and notifications
      fetchLeaves();
      fetchUserNotifications();
    };

    const handleLeaveRejected = (data) => {
      frontendLogger.info('Real-time leave rejected notification received', data);
      showSnackbar(`Leave Request rejected!`, 'warning');
      // Refresh leave list and notifications
      fetchLeaves();
      fetchUserNotifications();
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
  }, [fetchLeaves, fetchUserNotifications, showSnackbar]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
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

  const notifications = userNotifications;

  // Filter leaves based on search term and status
  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = !searchTerm || 
      (leave.employee && leave.employee.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.reason && leave.reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (leave.userName && leave.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || leave.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Form handlers
  const handleFormChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormState({
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  // Action handlers
  const handleApproveLeave = (leave) => {
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    openDialog('approve', leave);
  };

  const handleRejectLeave = (leave) => {
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    openDialog('reject', leave);
  };

  const handleEditLeave = (leave) => {
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setFormState({
      startDate: leave.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
      endDate: leave.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
      reason: leave.reason || ''
    });
    openDialog('edit', leave);
  };

  const handleDeleteLeave = (leave) => {
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    openDialog('delete', leave);
  };

  // Confirm actions
  const confirmApprove = async () => {
    const selectedLeave = dialogs.approve.leave;
    try {
      // Check if selectedLeave is not null before proceeding
      if (!selectedLeave || !selectedLeave.id) {
        console.error('Error: selectedLeave is null or missing id');
        setError('Cannot approve leave: Invalid leave selection');
        showSnackbar('Cannot approve leave: Invalid leave selection', 'error');
        closeDialog('approve');
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
      
      // Show success notification
      showSnackbar(`Leave Request approved!`, 'success');
      
      // Refresh leave list to ensure UI is updated
      setTimeout(() => {
        fetchLeaves();
      }, 1000);
    } catch (error) {
      console.error('Error approving leave:', error);
      const errorMessage = 'Failed to approve leave request: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      // Always close the dialog
      closeDialog('approve');
    }
  };

  const confirmReject = async () => {
    const selectedLeave = dialogs.reject.leave;
    try {
      // Check if selectedLeave is not null before proceeding
      if (!selectedLeave || !selectedLeave.id) {
        console.error('Error: selectedLeave is null or missing id');
        setError('Cannot reject leave: Invalid leave selection');
        showSnackbar('Cannot reject leave: Invalid leave selection', 'error');
        closeDialog('reject');
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
      
      // Show success notification
      showSnackbar(`Leave Request rejected!`, 'warning');
      
      // Refresh leave list to ensure UI is updated
      setTimeout(() => {
        fetchLeaves();
      }, 1000);
    } catch (error) {
      console.error('Error rejecting leave:', error);
      const errorMessage = 'Failed to reject leave request: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      // Always close the dialog
      closeDialog('reject');
    }
  };

  const confirmEditLeave = async () => {
    const editingLeave = dialogs.edit.leave;
    try {
      if (!editingLeave || !editingLeave.id) {
        setError('Invalid leave selection');
        showSnackbar('Cannot edit leave: Invalid leave selection', 'error');
        closeDialog('edit');
        return;
      }

      const leaveData = {
        startDate: formState.startDate,
        endDate: formState.endDate,
        reason: formState.reason
      };

      // Update leave through API
      await leaveAPI.updateLeave(editingLeave.id, leaveData);

      // Update leave in state
      setLeaves(leaves.map(leave => 
        leave.id === editingLeave.id 
          ? { ...leave, ...leaveData } 
          : leave
      ));

      // Log audit entry
      if (user) {
        auditLog.leaveUpdated(editingLeave.id, user.username || 'unknown');
      }

      // Close dialog and reset form
      closeDialog('edit');
      resetForm();

      // Show success notification
      showSnackbar('Leave request updated successfully!', 'success');

      // Refresh leave list
      fetchLeaves();
    } catch (error) {
      console.error('Error updating leave:', error);
      const errorMessage = 'Failed to update leave request: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      closeDialog('edit');
    }
  };

  const confirmDeleteLeave = async () => {
    const selectedLeave = dialogs.delete.leave;
    try {
      if (!selectedLeave || !selectedLeave.id) {
        setError('Invalid leave selection');
        showSnackbar('Cannot delete leave: Invalid leave selection', 'error');
        closeDialog('delete');
        return;
      }

      // Delete leave through API
      await leaveAPI.deleteLeave(selectedLeave.id);

      // Remove leave from state
      setLeaves(leaves.filter(leave => leave.id !== selectedLeave.id));

      // Log audit entry
      if (user) {
        auditLog.leaveDeleted(selectedLeave.id, user.username || 'unknown');
      }

      // Close dialog
      closeDialog('delete');

      // Show success notification
      showSnackbar('Leave request deleted successfully!', 'success');

      // Refresh leave list
      fetchLeaves();
    } catch (error) {
      console.error('Error deleting leave:', error);
      const errorMessage = 'Failed to delete leave request: ' + (error.response?.data?.message || error.message);
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      closeDialog('delete');
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const leaveData = {
        startDate: formState.startDate,
        endDate: formState.endDate,
        reason: formState.reason,
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
      setLeaves([...leaves, newLeave]);
      
      // Log audit entry
      if (user) {
        auditLog.leaveCreated(response.data.id, user.username || 'unknown');
      }
      
      // Reset form
      resetForm();
      
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
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <StyledTab label={t('leaves.leaveRequests')} icon={<SearchIcon />} iconPosition="start" />
          <StyledTab label={t('leaves.calendar')} icon={<CalendarIcon />} iconPosition="start" />
          <StyledTab label={t('leaves.notifications')} icon={<NotificationsIcon />} iconPosition="start" />
        </StyledTabs>
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
            <form onSubmit={handleSubmitLeave}>
              <Grid container spacing={2}>
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
                  <TableCell align="center">Employee</TableCell>
                  <TableCell align="center">Start Date</TableCell>
                  <TableCell align="center">End Date</TableCell>
                  <TableCell align="center">Reason</TableCell>
                  <TableCell align="center">Applied Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell align="center">{leave.employee || leave.userName || 'N/A'}</TableCell>
                    <TableCell align="center">{leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell align="center">{leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell align="center">{leave.reason || 'N/A'}</TableCell>
                    <TableCell align="center">{leave.appliedDate ? new Date(leave.appliedDate).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={leave.status || 'Pending'} 
                        color={
                          leave.status === 'Approved' ? 'success' : 
                          leave.status === 'Rejected' ? 'error' : 'warning'
                        } 
                      />
                    </TableCell>
                    <TableCell align="center">
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
      
      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          {userNotifications.length === 0 ? (
            <Typography>No notifications available</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Notification</TableCell>
                    <TableCell align="center">Time</TableCell>
                    <TableCell align="center">Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell align="center">{notification.message}</TableCell>
                      <TableCell align="center">{notification.time}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={notification.type} 
                          size="small" 
                          color={
                            notification.type === 'leave' ? 'primary' : 
                            notification.type === 'approval' ? 'success' : 
                            notification.type === 'rejection' ? 'error' : 'default'
                          } 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
          <Button onClick={confirmApprove} variant="contained" color="success">
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