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
  styled,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationsIcon,
  Download as DownloadIcon,
  PictureAsPdf as PictureAsPdfIcon
} from '@mui/icons-material';
import { leaveAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';
import notificationService from '../services/notificationService';
import frontendLogger from '../services/frontendLogger';
import autoRefreshService from '../services/autoRefreshService';
import FilterSection from './FilterSection';

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
  const [users, setUsers] = useState([]); // Add users state
  const [selectedUserForLeave, setSelectedUserForLeave] = useState(null); // Add selected user state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Leave Summary state
  const [leaveSummary, setLeaveSummary] = useState({});
  const [summaryUserFilter, setSummaryUserFilter] = useState('');
  const [summaryDateRange, setSummaryDateRange] = useState({ start: '', end: '' });
  
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
      } else if (user && (user.role === 'SystemAdmin' || user.role === 'Admin')) {
        // SystemAdmin and Admin can see all leaves
        // leavesData remains unchanged
      } else if (user && user.role === 'Supervisor') {
        // Supervisors see leaves from their office
        leavesData = leavesData.filter(leave => 
          leave.office === user.office
        );
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

  // Fetch users for System Admins and Admins
  const fetchUsers = useCallback(async () => {
    if (user && (user.role === 'SystemAdmin' || user.role === 'Admin')) {
      try {
        const response = await userAPI.getAllUsers();
        const usersData = response.data || [];
        // Sort users by full name for better UX
        const sortedUsers = usersData.sort((a, b) => {
          const nameA = (a.fullName || a.username || '').toLowerCase();
          const nameB = (b.fullName || b.username || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        showSnackbar('Failed to fetch users: ' + error.message, 'error');
      }
    }
  }, [user, showSnackbar]);

  // Fetch leaves on component mount
  useEffect(() => {
    fetchLeaves();
    fetchUsers(); // Also fetch users for System Admins
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('LeaveManagement', 'leaves', fetchLeaves, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('LeaveManagement');
    };
  }, [fetchLeaves, fetchUsers]);
  
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
      } else if (user.role === 'SystemAdmin' || user.role === 'Admin') {
        // SystemAdmin and Admin see all notifications
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
      } else if (user.role === 'Supervisor') {
        // Supervisors see notifications for their team
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
  const getCalendarData = (date = currentDate) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
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
  const getLeaveCalendarData = (date = currentDate) => {
    const calendarData = getCalendarData(date);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Create a map of leave dates
    const leaveMap = {};
    leaves.forEach(leave => {
      if (leave.startDate && leave.endDate) {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        
        // Only include leaves for the selected month
        if (start.getFullYear() === year && start.getMonth() === month) {
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getMonth() === month) {
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
  
  // Generate leave summary data
  useEffect(() => {
    if (leaves.length > 0) {
      const summary = {};
      leaves.forEach(leave => {
        // Use full name if available, otherwise username
        // Extract full name from the user data
        const userFullName = users.find(u => u.id === leave.userId)?.fullName || 
                      leave.employee || leave.userName || leave.requestedByName || 'Unknown';
        
        if (!summary[userFullName]) {
          summary[userFullName] = {
            name: userFullName,
            totalLeaves: 0,
            leaveList: []
          };
        }
        summary[userFullName].totalLeaves++;
        summary[userFullName].leaveList.push({
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
          appliedDate: leave.appliedDate
        });
      });
      setLeaveSummary(summary);
    }
  }, [leaves, users]);
  
  // Filtered leave summary based on user selection and date range
  const filteredLeaveSummary = Object.fromEntries(
    Object.entries(leaveSummary).filter(([userName, data]) => {
      // User filter
      const matchesUser = !summaryUserFilter || userName.toLowerCase().includes(summaryUserFilter.toLowerCase());
      
      // Date range filter
      const matchesDateRange = data.leaveList.some(leave => {
        const leaveStart = new Date(leave.startDate);
        const leaveEnd = new Date(leave.endDate);
        
        const startDateFilter = summaryDateRange.start ? new Date(summaryDateRange.start) : null;
        const endDateFilter = summaryDateRange.end ? new Date(summaryDateRange.end) : null;
        
        // If both start and end date are provided, check if the leave period overlaps with the filter range
        if (startDateFilter && endDateFilter) {
          return (leaveStart <= endDateFilter && leaveEnd >= startDateFilter);
        }
        // If only start date is provided, check if the leave period starts before or during the filter
        else if (startDateFilter) {
          return leaveEnd >= startDateFilter;
        }
        // If only end date is provided, check if the leave period ends during or after the filter
        else if (endDateFilter) {
          return leaveStart <= endDateFilter;
        }
        
        // If no date filters, include all
        return true;
      });
      
      return matchesUser && matchesDateRange;
    }).map(([userName, data]) => {
      // Filter the leaveList based on date range
      let filteredLeaveList = data.leaveList;
      if (summaryDateRange.start || summaryDateRange.end) {
        filteredLeaveList = data.leaveList.filter(leave => {
          const leaveStart = new Date(leave.startDate);
          const leaveEnd = new Date(leave.endDate);
          
          const startDateFilter = summaryDateRange.start ? new Date(summaryDateRange.start) : null;
          const endDateFilter = summaryDateRange.end ? new Date(summaryDateRange.end) : null;
          
          if (startDateFilter && endDateFilter) {
            return (leaveStart <= endDateFilter && leaveEnd >= startDateFilter);
          } else if (startDateFilter) {
            return leaveEnd >= startDateFilter;
          } else if (endDateFilter) {
            return leaveStart <= endDateFilter;
          }
          return true;
        });
      }
      
      return [userName, { ...data, leaveList: filteredLeaveList, totalLeaves: filteredLeaveList.length }];
    })
  );
  
  // Handle calendar navigation
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  // Get current month/year display
  const currentMonthDisplay = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Get updated calendar data based on current date
  const { calendarData: currentCalendarData, leaveMap: currentLeaveMap } = getLeaveCalendarData();

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

  // Check if any filters are active
  const hasActiveFilters = Boolean(searchTerm || statusFilter);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

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
    // Check if user has permission to approve leaves
    if (!user || !(user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor')) {
      setError('You do not have permission to approve leave requests');
      showSnackbar('You do not have permission to approve leave requests', 'error');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    if (!leave || !leave.id) {
      setError('Invalid leave selection');
      setTimeout(() => setError(''), 5000);
      return;
    }
    openDialog('approve', leave);
  };

  const handleRejectLeave = (leave) => {
    // Check if user has permission to reject leaves
    if (!user || !(user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor')) {
      setError('You do not have permission to reject leave requests');
      showSnackbar('You do not have permission to reject leave requests', 'error');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
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
    
    // Check if user has permission to edit this leave
    if (!user || !(user.role === 'SystemAdmin' || user.role === 'Admin' || 
         (user.id === leave.userId && leave.status === 'Pending'))) {
      setError('You do not have permission to edit this leave request');
      showSnackbar('You do not have permission to edit this leave request', 'error');
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
    
    // Check if user has permission to delete this leave
    if (!user || !(user.role === 'SystemAdmin' || user.role === 'Admin' || user.id === leave.userId)) {
      setError('You do not have permission to delete this leave request');
      showSnackbar('You do not have permission to delete this leave request', 'error');
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
    
    // Validate dates
    if (!formState.startDate || !formState.endDate) {
      setError('Please select both start and end dates');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    const startDate = new Date(formState.startDate);
    const endDate = new Date(formState.endDate);
    
    // Allow same start and end date for single day leave
    if (startDate > endDate) {
      setError('Start date cannot be after end date (can be same as end date for single day leave)');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    // If start and end date are the same, it's a single day leave
    // The system will accept same start and end date as a single day
    try {
      // Determine which user the leave is for
      let leaveUser = user; // Default to current user
      if (user.role === 'SystemAdmin' && selectedUserForLeave) {
        leaveUser = selectedUserForLeave;
      }
      
      const leaveData = {
        startDate: formState.startDate,
        endDate: formState.endDate,
        reason: formState.reason,
        appliedDate: new Date().toISOString().split('T')[0],
        userId: leaveUser.id,
        userName: leaveUser.username || leaveUser.fullName,
        office: leaveUser.office,
        // Add requester information
        requestedBy: user.id,
        requestedByName: user.username || user.fullName
      };
      
      const response = await leaveAPI.createLeave(leaveData);
      
      // Add new leave to list
      const newLeave = {
        id: response.data.id,
        employee: leaveUser?.fullName || leaveUser?.username || 'Current User',
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
      if (user.role === 'SystemAdmin') {
        setSelectedUserForLeave(null);
      }
      
      // Show success notification
      showSnackbar(`Leave request for ${newLeave.startDate} to ${newLeave.endDate} submitted successfully!`, 'success');
    } catch (error) {
      console.error('Error submitting leave:', error);
      setError('Failed to submit leave request: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  // Export functions
  const exportToCSV = () => {
    try {
      // Prepare CSV data
      const csvHeaders = ['Employee', 'Start Date', 'End Date', 'Reason', 'Applied Date', 'Requested By', 'Status'];
      const csvRows = filteredLeaves.map(leave => [
        leave.employee || leave.userName || 'N/A',
        leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A',
        leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A',
        leave.reason || 'N/A',
        leave.appliedDate ? new Date(leave.appliedDate).toLocaleDateString() : 'N/A',
        leave.requestedByName || leave.userName || 'N/A',
        leave.status || 'Pending'
      ]);
      
      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `leave_requests_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSnackbar('Leave data exported to CSV successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      showSnackbar('Failed to export CSV: ' + error.message, 'error');
    }
  };

  const exportToPDF = () => {
    try {
      // Simple PDF generation using browser print functionality
      // In a real app, you'd use a library like jsPDF
      const printWindow = window.open('', '_blank');
      const printContent = `
        <html>
        <head>
          <title>Leave Requests Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Leave Requests Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Applied Date</th>
                <th>Requested By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLeaves.map(leave => `
                <tr>
                  <td>${leave.employee || leave.userName || 'N/A'}</td>
                  <td>${leave.startDate ? new Date(leave.startDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${leave.endDate ? new Date(leave.endDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${leave.reason || 'N/A'}</td>
                  <td>${leave.appliedDate ? new Date(leave.appliedDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${leave.requestedByName || leave.userName || 'N/A'}</td>
                  <td>${leave.status || 'Pending'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      
      showSnackbar('Leave data exported to PDF successfully!', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      showSnackbar('Failed to export PDF: ' + error.message, 'error');
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
          <StyledTab label="Leave Summary" icon={<CalendarIcon />} iconPosition="start" />
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
                {/* Show user dropdown only for System Admins */}
                {user.role === 'SystemAdmin' && (
                  <Grid item xs={12}>
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => 
                        option ? (option.fullName || option.username) + ' (' + (option.username || option.email) + ')' : ''
                      }
                      value={selectedUserForLeave}
                      onChange={(event, newValue) => {
                        setSelectedUserForLeave(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Assign Leave To" 
                          fullWidth 
                          required
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                    />
                  </Grid>
                )}
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
          
          {/* Modern Expandable Filter Section */}
          <FilterSection
            title="Advanced Filters"
            defaultExpanded={false}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearAllFilters}
          >
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
          </FilterSection>
          
          {/* Leave List */}
          {/* Export Buttons */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              Export CSV
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdfIcon />}
              onClick={exportToPDF}
            >
              Export PDF
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center">Employee</TableCell>
                  <TableCell align="center">Start Date</TableCell>
                  <TableCell align="center">End Date</TableCell>
                  <TableCell align="center">Reason</TableCell>
                  <TableCell align="center">Applied Date</TableCell>
                  <TableCell align="center">Requested By</TableCell>
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
                    <TableCell align="center">{leave.requestedByName || leave.userName || 'N/A'}</TableCell>
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
                      {leave.status === 'Pending' && user && (user.role === 'SystemAdmin' || user.role === 'Admin' || user.role === 'Supervisor') && (
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
                      {(user.role === 'SystemAdmin' || user.role === 'Admin' || (user.id === leave.userId && leave.status === 'Pending')) && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditLeave(leave)}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {(user.role === 'SystemAdmin' || user.role === 'Admin' || user.id === leave.userId) && (
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteLeave(leave)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
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
                <Button variant="outlined" onClick={goToPreviousMonth}>Previous</Button>
                <Typography variant="h6">{currentMonthDisplay}</Typography>
                <Button variant="outlined" onClick={goToNextMonth}>Next</Button>
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
                  {currentCalendarData.map((week, weekIndex) => (
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
                              {currentLeaveMap[day] && currentLeaveMap[day].map((leave, index) => (
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
            Leave Summary
          </Typography>
          
          {/* Summary Filters */}
          <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => 
                option ? (option.fullName || option.username) + ' (' + (option.username || option.email) + ')' : ''
              }
              value={users.find(u => 
                (u.fullName || u.username) + ' (' + (u.username || u.email) + ')' === summaryUserFilter
              ) || null}
              onChange={(event, newValue) => {
                setSummaryUserFilter(newValue ? 
                  (newValue.fullName || newValue.username) + ' (' + (newValue.username || newValue.email) + ')'
                  : '');
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  label="Filter by User" 
                  sx={{ minWidth: 300 }}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
            />
            <TextField
              label="From Date"
              type="date"
              value={summaryDateRange.start}
              onChange={(e) => setSummaryDateRange({...summaryDateRange, start: e.target.value})}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="To Date"
              type="date"
              value={summaryDateRange.end}
              onChange={(e) => setSummaryDateRange({...summaryDateRange, end: e.target.value})}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <Button 
              variant="outlined" 
              onClick={() => {
                setSummaryUserFilter('');
                setSummaryDateRange({ start: '', end: '' });
              }}
            >
              Clear Filters
            </Button>
          </Box>
          
          {/* Export Buttons for Summary */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={() => {
                // Filter the summary data based on current filters
                const filteredData = Object.entries(filteredLeaveSummary);
                
                // Prepare CSV data for summary
                const csvHeaders = ['User', 'Total Leaves', 'Leave Details'];
                const csvRows = filteredData.map(([userName, data]) => [
                  userName,
                  data.totalLeaves,
                  data.leaveList.map(leave => 
                    `${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()} (${leave.status})`
                  ).join('; ')
                ]);
                
                // Create CSV content
                const csvContent = [
                  csvHeaders.join(','),
                  ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
                ].join('\n');
                
                // Create download link
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `leave_summary_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showSnackbar('Leave summary exported to CSV successfully!', 'success');
              }}
            >
              Export Summary CSV
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdfIcon />}
              onClick={() => {
                // Simple PDF generation using browser print functionality
                const filteredData = Object.entries(filteredLeaveSummary);
                const printWindow = window.open('', '_blank');
                const printContent = `
                  <html>
                  <head>
                    <title>Leave Summary Report</title>
                    <style>
                      body { font-family: Arial, sans-serif; margin: 20px; }
                      h1 { color: #333; }
                      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                      th { background-color: #f2f2f2; }
                      tr:nth-child(even) { background-color: #f9f9f9; }
                    </style>
                  </head>
                  <body>
                    <h1>Leave Summary Report</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Total Leaves</th>
                          <th>Leave Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${filteredData.map(([userName, data]) => `
                          <tr>
                            <td>${userName}</td>
                            <td>${data.totalLeaves}</td>
                            <td>
                              ${data.leaveList.map(leave => `
                                <div style="margin-bottom: 5px;">
                                  <strong>Dates:</strong> ${new Date(leave.startDate).toLocaleDateString()} - ${new Date(leave.endDate).toLocaleDateString()}<br/>
                                  <strong>Reason:</strong> ${leave.reason}<br/>
                                  <strong>Status:</strong> ${leave.status}<br/>
                                  <strong>Applied:</strong> ${new Date(leave.appliedDate).toLocaleDateString()}
                                </div>
                              `).join('')}
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </body>
                  </html>
                `;
                
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.print();
                
                showSnackbar('Leave summary exported to PDF successfully!', 'success');
              }}
            >
              Export Summary PDF
            </Button>
          </Box>
          
          {/* Summary Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>User</strong></TableCell>
                  <TableCell align="center"><strong>Total Leaves</strong></TableCell>
                  <TableCell align="center"><strong>Leave Details</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(filteredLeaveSummary).length > 0 ? (
                  Object.entries(filteredLeaveSummary).map(([userName, data]) => (
                    <TableRow key={userName}>
                      <TableCell align="center">{userName}</TableCell>
                      <TableCell align="center">{data.totalLeaves}</TableCell>
                      <TableCell>
                        {data.leaveList.map((leave, index) => (
                          <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                            <Typography variant="body2">
                              <strong>Leave:</strong> {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Reason:</strong> {leave.reason}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Status:</strong> <Chip size="small" label={leave.status} color=
                                {leave.status === 'Approved' ? 'success' : 
                                leave.status === 'Rejected' ? 'error' : 'warning'} />
                            </Typography>
                          </Box>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No leave summary data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      
      {activeTab === 3 && (
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
}

export default LeaveManagement;