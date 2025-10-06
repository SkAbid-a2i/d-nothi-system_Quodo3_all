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
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Zoom,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  AdminPanelSettings
} from '@mui/icons-material';
import { userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { auditLog } from '../services/auditLogger';
import notificationService from '../services/notificationService';

const RealUserManagement = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [dialogs, setDialogs] = useState({
    create: { open: false },
    edit: { open: false, user: null },
    delete: { open: false, user: null }
  });
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'Agent',
    office: '',
    isActive: true
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setDataLoading(true);
    setError('');
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
      
      // Log audit entry
      auditLog.userFetched((response.data || []).length, currentUser?.username || 'unknown');
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users. Please try again.';
      setError(errorMessage);
    } finally {
      setDataLoading(false);
    }
  }, [currentUser?.username]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleUserCreated = (data) => {
      setSuccess(`New user created: ${data.user.username}`);
      fetchUsers(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleUserUpdated = (data) => {
      setSuccess(`User updated: ${data.user.username}`);
      fetchUsers(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleUserDeleted = (data) => {
      setSuccess(`User deleted: ${data.username}`);
      fetchUsers(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    // Subscribe to notifications
    notificationService.onUserCreated(handleUserCreated);
    notificationService.onUserUpdated(handleUserUpdated);
    notificationService.onUserDeleted(handleUserDeleted);

    // Cleanup on unmount
    return () => {
      notificationService.off('userCreated', handleUserCreated);
      notificationService.off('userUpdated', handleUserUpdated);
      notificationService.off('userDeleted', handleUserDeleted);
    };
  }, [fetchUsers]);

  const showSnackbar = (message, severity = 'success') => {
    if (severity === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  const openDialog = (dialogType, user = null) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: true, user }
    }));
    
    // Pre-populate form for edit
    if (dialogType === 'edit' && user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        role: user.role || 'Agent',
        office: user.office || '',
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else if (dialogType === 'create') {
      // Reset form for create
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'Agent',
        office: '',
        isActive: true
      });
    }
  };

  const closeDialog = (dialogType) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: false, user: null }
    }));
  };

  const closeAllDialogs = () => {
    setDialogs({
      create: { open: false },
      edit: { open: false, user: null },
      delete: { open: false, user: null }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      isActive: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.username || !formData.email) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (dialogs.edit.user) {
        // Update existing user
        const response = await userAPI.updateUser(dialogs.edit.user.id, {
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          office: formData.office,
          isActive: formData.isActive
        });
        
        showSnackbar('User updated successfully!', 'success');
        // Log audit entry
        auditLog.userUpdated(dialogs.edit.user.id, currentUser?.username || 'unknown');
      } else {
        // Create new user
        const response = await userAPI.createUser({
          fullName: formData.fullName,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          office: formData.office,
          isActive: formData.isActive
        });
        
        showSnackbar('User created successfully!', 'success');
        // Log audit entry
        auditLog.userCreated(response.data.id, currentUser?.username || 'unknown');
      }
      
      closeAllDialogs();
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error saving user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await userAPI.deleteUser(dialogs.delete.user.id);
      showSnackbar('User deleted successfully!', 'success');
      closeDialog('delete');
      fetchUsers(); // Refresh data
      // Log audit entry
      auditLog.userDeleted(dialogs.delete.user.id, currentUser?.username || 'unknown');
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error deleting user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      const userToUpdate = users.find(u => u.id === userId);
      const response = await userAPI.updateUser(userId, {
        ...userToUpdate,
        isActive: !currentStatus
      });
      
      showSnackbar(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
      fetchUsers(); // Refresh data
      // Log audit entry
      auditLog.userUpdated(userId, currentUser?.username || 'unknown');
    } catch (error) {
      console.error('Error updating user status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error updating user status';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchTerm || 
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || u.role === roleFilter;
    const matchesStatus = statusFilter === '' || 
      (statusFilter === 'active' && u.isActive) || 
      (statusFilter === 'inactive' && !u.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
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
            User Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Manage users, roles, and permissions
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{success}</Alert>
        )}

        <Grid container spacing={3}>
          {/* User List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Users
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                    }}
                  />
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      label="Role"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Agent">Agent</MenuItem>
                      <MenuItem value="Supervisor">Supervisor</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="SystemAdmin">System Admin</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => openDialog('create')}
                    sx={{ 
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #764ba2, #667eea)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                      }
                    }}
                  >
                    Create User
                  </Button>
                </Box>
              </Box>
              
              {dataLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Office</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow 
                          key={u.id} 
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
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32,
                                  bgcolor: u.role === 'SystemAdmin' ? 'secondary.main' : 
                                          u.role === 'Admin' ? 'primary.main' : 
                                          u.role === 'Supervisor' ? 'warning.main' : 'info.main',
                                  color: 'white',
                                  fontSize: 12,
                                  fontWeight: 600,
                                  mr: 1
                                }}
                              >
                                {u.fullName.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {u.fullName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {u.username} • {u.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              icon={u.role === 'SystemAdmin' || u.role === 'Admin' ? <AdminPanelSettings /> : undefined}
                              label={u.role}
                              size="small"
                              sx={{ 
                                bgcolor: u.role === 'SystemAdmin' ? '#f093fb20' : 
                                        u.role === 'Admin' ? '#667eea20' : 
                                        u.role === 'Supervisor' ? '#f59e0b20' : 
                                        '#3b82f620',
                                color: u.role === 'SystemAdmin' ? '#f093fb' : 
                                      u.role === 'Admin' ? '#667eea' : 
                                      u.role === 'Supervisor' ? '#f59e0b' : 
                                      '#3b82f6',
                                fontWeight: 600
                              }} 
                            />
                          </TableCell>
                          <TableCell>{u.office || 'Not assigned'}</TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={u.isActive}
                                  onChange={() => handleToggleStatus(u.id, u.isActive)}
                                  color="primary"
                                  disabled={loading}
                                />
                              }
                              label={u.isActive ? 'Active' : 'Inactive'}
                              sx={{ 
                                '& .MuiFormControlLabel-label': { 
                                  fontSize: '0.875rem',
                                  fontWeight: u.isActive ? 600 : 400,
                                  color: u.isActive ? 'success.main' : 'text.secondary'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => openDialog('edit', u)}
                              sx={{ mr: 1 }}
                              disabled={loading}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => openDialog('delete', u)}
                              disabled={loading}
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
        
        {/* Create/Edit Dialog */}
        <Dialog 
          open={dialogs.create.open || dialogs.edit.open} 
          onClose={() => closeDialog(dialogs.create.open ? 'create' : 'edit')}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              {dialogs.edit.user ? 'Edit User' : 'Create New User'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                
                {!dialogs.edit.user && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!dialogs.edit.user}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      label="Role"
                    >
                      <MenuItem value="Agent">Agent</MenuItem>
                      <MenuItem value="Supervisor">Supervisor</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="SystemAdmin">System Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Office"
                    name="office"
                    value={formData.office}
                    onChange={handleInputChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isActive}
                        onChange={handleSwitchChange}
                        color="primary"
                      />
                    }
                    label="Active"
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog(dialogs.create.open ? 'create' : 'edit')}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              startIcon={loading ? <CircularProgress size={20} /> : (dialogs.edit.user ? <SaveIcon /> : <AddIcon />)}
              disabled={loading}
            >
              {loading ? (dialogs.edit.user ? 'Updating...' : 'Creating...') : (dialogs.edit.user ? 'Update User' : 'Create User')}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Dialog */}
        <Dialog open={dialogs.delete.open} onClose={() => closeDialog('delete')}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
              Delete User
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this user? This action cannot be undone.
            </Typography>
            {dialogs.delete.user && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {dialogs.delete.user.fullName} ({dialogs.delete.user.username})
                </Typography>
                <Typography variant="caption">
                  {dialogs.delete.user.email}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('delete')}>Cancel</Button>
            <Button 
              onClick={handleDeleteUser} 
              variant="contained" 
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default RealUserManagement;