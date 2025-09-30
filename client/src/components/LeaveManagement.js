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
  Tab
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

const LeaveManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  
  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  // Fetch leaves on component mount
  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);
  
  const fetchLeaves = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await leaveAPI.getAllLeaves();
      setLeaves(response.data);
      
      // Log audit entry
      auditLog.leaveCreated(response.data.length, user?.username || 'unknown');
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  }, [user?.username]);
  
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

  const handleApproveLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenApproveDialog(true);
  };

  const handleRejectLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenRejectDialog(true);
  };

  const confirmApprove = async () => {
    try {
      await leaveAPI.approveLeave(selectedLeave.id);
      
      // Update leave status to approved
      setLeaves(leaves.map(leave => 
        leave.id === selectedLeave.id 
          ? { ...leave, status: 'Approved' } 
          : leave
      ));
      
      // Log audit entry
      auditLog.leaveApproved(selectedLeave.id, user?.username || 'unknown');
      
      setOpenApproveDialog(false);
      setSelectedLeave(null);
      setSuccess('Leave request approved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error approving leave:', error);
      setError('Failed to approve leave request');
      setTimeout(() => setError(''), 5000);
    }
  };

  const confirmReject = async () => {
    try {
      await leaveAPI.rejectLeave(selectedLeave.id, { reason: 'Rejected by admin' });
      
      // Update leave status to rejected
      setLeaves(leaves.map(leave => 
        leave.id === selectedLeave.id 
          ? { ...leave, status: 'Rejected' } 
          : leave
      ));
      
      // Log audit entry
      auditLog.leaveRejected(selectedLeave.id, user?.username || 'unknown', 'Rejected by admin');
      
      setOpenRejectDialog(false);
      setSelectedLeave(null);
      setSuccess('Leave request rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error rejecting leave:', error);
      setError('Failed to reject leave request');
      setTimeout(() => setError(''), 5000);
    }
  };
  
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
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
      auditLog.leaveCreated(response.data.id, user?.username || 'unknown');
      
      // Reset form
      setStartDate('');
      setEndDate('');
      setReason('');
      
      setSuccess('Leave request submitted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error submitting leave:', error);
      setError('Failed to submit leave request');
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
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
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
                {leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.employee}</TableCell>
                    <TableCell>{leave.startDate}</TableCell>
                    <TableCell>{leave.endDate}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>{leave.appliedDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
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
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>{t('common.approve')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('leaves.confirmApprove')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApproveDialog(false)}>Cancel</Button>
          <Button onClick={confirmApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)}>
        <DialogTitle>{t('common.reject')} {t('leaves.leaveRequests')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('leaves.confirmReject')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRejectDialog(false)}>Cancel</Button>
          <Button onClick={confirmReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveManagement;