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

const ModernLeaveManagement = () => {
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

  // Mock data for leaves
  const mockLeaves = [
    {
      id: 1,
      userId: 101,
      userName: 'John Doe',
      office: 'Head Office',
      startDate: '2023-06-20',
      endDate: '2023-06-25',
      reason: 'Annual vacation',
      status: 'Approved',
      approvedBy: 'Admin User',
      approvedAt: '2023-06-15T10:30:00Z',
      createdAt: '2023-06-10T09:15:00Z'
    },
    {
      id: 2,
      userId: 102,
      userName: 'Jane Smith',
      office: 'Branch Office',
      startDate: '2023-06-22',
      endDate: '2023-06-23',
      reason: 'Medical appointment',
      status: 'Pending',
      createdAt: '2023-06-18T14:20:00Z'
    },
    {
      id: 3,
      userId: 103,
      userName: 'Mike Johnson',
      office: 'Head Office',
      startDate: '2023-06-25',
      endDate: '2023-06-30',
      reason: 'Family emergency',
      status: 'Rejected',
      approvedBy: 'Admin User',
      approvedAt: '2023-06-19T16:45:00Z',
      rejectionReason: 'Insufficient notice',
      createdAt: '2023-06-19T09:30:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading leaves
    setLoading(true);
    const timer = setTimeout(() => {
      setLeaves(mockLeaves);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

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
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newLeave = {
        id: leaves.length + 1,
        userId: 999, // Current user ID
        userName: 'Current User',
        office: 'Head Office',
        startDate: mainFormState.startDate,
        endDate: mainFormState.endDate,
        reason: mainFormState.reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };
      
      setLeaves([newLeave, ...leaves]);
      setMainFormState({
        startDate: '',
        endDate: '',
        reason: ''
      });
      
      showSnackbar('Leave request submitted successfully!', 'success');
    } catch (error) {
      showSnackbar('Error submitting leave request: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLeave = async (leaveId) => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedLeaves = leaves.map(leave => 
        leave.id === leaveId 
          ? { 
              ...leave, 
              status: 'Approved',
              approvedBy: 'Current Admin',
              approvedAt: new Date().toISOString()
            } 
          : leave
      );
      
      setLeaves(updatedLeaves);
      closeDialog('approve');
      showSnackbar('Leave request approved!', 'success');
    } catch (error) {
      showSnackbar('Error approving leave: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedLeaves = leaves.map(leave => 
        leave.id === leaveId 
          ? { 
              ...leave, 
              status: 'Rejected',
              approvedBy: 'Current Admin',
              approvedAt: new Date().toISOString(),
              rejectionReason: 'Rejected by admin'
            } 
          : leave
      );
      
      setLeaves(updatedLeaves);
      closeDialog('reject');
      showSnackbar('Leave request rejected!', 'success');
    } catch (error) {
      showSnackbar('Error rejecting leave: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
            Leave Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Request, approve, and manage leave applications
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Leave Request Form */}
          <Grid item xs={12} lg={4}>
            <Zoom in={true} timeout={800}>
              <Paper 
                sx={{ 
                  p: 3, 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                  border: '1px solid rgba(102, 126, 234, 0.2)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <EventAvailable sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Request Leave
                  </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={mainFormState.startDate}
                        onChange={(e) => setMainFormState({...mainFormState, startDate: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={mainFormState.endDate}
                        onChange={(e) => setMainFormState({...mainFormState, endDate: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Reason"
                        multiline
                        rows={4}
                        value={mainFormState.reason}
                        onChange={(e) => setMainFormState({...mainFormState, reason: e.target.value})}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                        sx={{ 
                          py: 1.5,
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #764ba2, #667eea)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }
                        }}
                      >
                        {loading ? 'Submitting...' : 'Submit Request'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
          
          {/* Leave List */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Leave Requests
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search leaves..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                    }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Approved">Approved</MenuItem>
                      <MenuItem value="Rejected">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                sx={{ mb: 2 }}
                TabIndicatorProps={{ style: { background: 'linear-gradient(45deg, #667eea, #764ba2)' } }}
              >
                <Tab label="All Requests" />
                <Tab label="My Requests" />
              </Tabs>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Start Date</TableCell>
                        <TableCell>End Date</TableCell>
                        <TableCell>Reason</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLeaves.map((leave) => (
                        <TableRow 
                          key={leave.id} 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'action.hover',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: '50%', 
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 12,
                                fontWeight: 600,
                                mr: 1
                              }}>
                                {leave.userName.charAt(0)}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {leave.userName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {leave.office}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>{leave.startDate}</TableCell>
                          <TableCell>{leave.endDate}</TableCell>
                          <TableCell>{leave.reason}</TableCell>
                          <TableCell>
                            <Chip 
                              label={leave.status} 
                              size="small"
                              sx={{ 
                                bgcolor: leave.status === 'Approved' ? '#10b98120' : 
                                        leave.status === 'Pending' ? '#f59e0b20' : 
                                        '#ef444420',
                                color: leave.status === 'Approved' ? '#10b981' : 
                                      leave.status === 'Pending' ? '#f59e0b' : 
                                      '#ef4444',
                                fontWeight: 600
                              }} 
                            />
                          </TableCell>
                          <TableCell>
                            {leave.status === 'Pending' && (
                              <>
                                <IconButton 
                                  size="small" 
                                  color="success" 
                                  onClick={() => openDialog('approve', leave)}
                                  sx={{ mr: 1 }}
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
                              color="primary" 
                              onClick={() => openDialog('edit', leave)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
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
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Approve Dialog */}
        <Dialog open={dialogs.approve.open} onClose={() => closeDialog('approve')}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon sx={{ mr: 1, color: 'success.main' }} />
              Approve Leave Request
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to approve this leave request?
            </Typography>
            {dialogs.approve.leave && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {dialogs.approve.leave.userName} - {dialogs.approve.leave.reason}
                </Typography>
                <Typography variant="caption">
                  {dialogs.approve.leave.startDate} to {dialogs.approve.leave.endDate}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('approve')}>Cancel</Button>
            <Button 
              onClick={() => handleApproveLeave(dialogs.approve.leave?.id)} 
              variant="contained" 
              color="success"
              startIcon={<CheckIcon />}
            >
              Approve
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Reject Dialog */}
        <Dialog open={dialogs.reject.open} onClose={() => closeDialog('reject')}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CloseIcon sx={{ mr: 1, color: 'error.main' }} />
              Reject Leave Request
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to reject this leave request?
            </Typography>
            {dialogs.reject.leave && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {dialogs.reject.leave.userName} - {dialogs.reject.leave.reason}
                </Typography>
                <Typography variant="caption">
                  {dialogs.reject.leave.startDate} to {dialogs.reject.leave.endDate}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('reject')}>Cancel</Button>
            <Button 
              onClick={() => handleRejectLeave(dialogs.reject.leave?.id)} 
              variant="contained" 
              color="error"
              startIcon={<CloseIcon />}
            >
              Reject
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
    </Fade>
  );
};

export default ModernLeaveManagement;