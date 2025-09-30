import React, { useState } from 'react';
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
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([
    {
      id: 1,
      employee: 'John Doe',
      startDate: '2025-10-01',
      endDate: '2025-10-03',
      reason: 'Personal work',
      status: 'Pending',
      appliedDate: '2025-09-25'
    },
    {
      id: 2,
      employee: 'Jane Smith',
      startDate: '2025-10-05',
      endDate: '2025-10-07',
      reason: 'Medical appointment',
      status: 'Approved',
      appliedDate: '2025-09-20'
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const handleApproveLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenApproveDialog(true);
  };

  const handleRejectLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenRejectDialog(true);
  };

  const confirmApprove = () => {
    // Update leave status to approved
    setLeaves(leaves.map(leave => 
      leave.id === selectedLeave.id 
        ? { ...leave, status: 'Approved' } 
        : leave
    ));
    setOpenApproveDialog(false);
    setSelectedLeave(null);
  };

  const confirmReject = () => {
    // Update leave status to rejected
    setLeaves(leaves.map(leave => 
      leave.id === selectedLeave.id 
        ? { ...leave, status: 'Rejected' } 
        : leave
    ));
    setOpenRejectDialog(false);
    setSelectedLeave(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Leave Management
      </Typography>
      
      {/* Leave Request Form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Request New Leave
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Reason"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" startIcon={<AddIcon />}>
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
              label="Search Leaves"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: <SearchIcon />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
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
      
      {/* Approve Dialog */}
      <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)}>
        <DialogTitle>Approve Leave Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve this leave request?
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
        <DialogTitle>Reject Leave Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reject this leave request?
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