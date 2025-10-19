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
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { userAPI } from '../services/api';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';

const ModernUserManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'Agent',
    office: '',
    bloodGroup: '',
    phoneNumber: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const showSnackbar = (message, severity = 'success') => {
    if (severity === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('ModernUserManagement', 'users', fetchUsers, 30000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('ModernUserManagement');
    };
  }, [fetchUsers]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleUserCreated = (data) => {
      showSnackbar(`New user created: ${data.user.username}`, 'info');
      fetchUsers();
    };

    const handleUserUpdated = (data) => {
      showSnackbar(`User updated: ${data.user.username}`, 'info');
      fetchUsers();
    };

    const handleUserDeleted = (data) => {
      showSnackbar(`User deleted: ${data.username}`, 'warning');
      fetchUsers();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.username || !formData.email) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing user
        await userAPI.updateUser(editingUserId, formData);
        showSnackbar('User updated successfully!', 'success');
      } else {
        // Create new user
        await userAPI.createUser(formData);
        showSnackbar('User created successfully!', 'success');
      }
      
      // Reset form
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'Agent',
        office: '',
        bloodGroup: '',
        phoneNumber: '',
        bio: ''
      });
      setIsEditing(false);
      setEditingUserId(null);
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      const errorMessage = 'Error saving user: ' + (error.response?.data?.message || error.message);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleEditUser = (user) => {
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      office: user.office,
      bloodGroup: user.bloodGroup || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || ''
    });
    setIsEditing(true);
    setEditingUserId(user.id);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      showSnackbar('User deleted successfully!', 'success');
      // Refresh users list
      fetchUsers();
    } catch (error) {
      const errorMessage = 'Error deleting user: ' + (error.response?.data?.message || error.message);
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;

      const updatedUserData = { ...userToUpdate, isActive: !currentStatus };
      await userAPI.updateUser(userId, updatedUserData);
      
      // Update local state
      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      
      showSnackbar('User status updated successfully!', 'success');
    } catch (error) {
      const errorMessage = 'Error updating user status: ' + (error.response?.data?.message || error.message);
      showSnackbar(errorMessage, 'error');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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
          User Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Manage users, roles, and permissions
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

      <Paper sx={{ width: '100%', borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              minHeight: 48
            },
            '& .MuiTabs-indicator': {
              height: 3,
              background: 'linear-gradient(45deg, #667eea, #764ba2)'
            }
          }}
        >
          <Tab label="User Management" icon={<PeopleIcon />} iconPosition="start" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {isEditing ? 'Edit User' : 'Create New User'}
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Blood Group"
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    {!isEditing && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Password"
                          name="password"
                          type="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!isEditing}
                        />
                      </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
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
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Office"
                        name="office"
                        value={formData.office}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        name="bio"
                        multiline
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <SaveIcon /> : <AddIcon />)}
                          disabled={loading}
                          sx={{ 
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #764ba2, #667eea)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User')}
                        </Button>
                        {isEditing && (
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setIsEditing(false);
                              setEditingUserId(null);
                              setFormData({
                                fullName: '',
                                username: '',
                                email: '',
                                password: '',
                                role: 'Agent',
                                office: '',
                                bloodGroup: '',
                                phoneNumber: '',
                                bio: ''
                              });
                            }}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    User List
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                        <MenuItem value="">All Roles</MenuItem>
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
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Office</TableCell>
                          <TableCell>Blood Group</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow 
                            key={user.id} 
                            sx={{ 
                              '&:hover': { 
                                backgroundColor: 'action.hover',
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              }
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                  {user.fullName.charAt(0)}
                                </Avatar>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {user.fullName}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role} 
                                size="small"
                                sx={{ 
                                  bgcolor: user.role === 'SystemAdmin' ? '#ef444420' : 
                                           user.role === 'Admin' ? '#f59e0b20' : 
                                           user.role === 'Supervisor' ? '#8b5cf620' : '#667eea20',
                                  color: user.role === 'SystemAdmin' ? '#ef4444' : 
                                         user.role === 'Admin' ? '#f59e0b' : 
                                         user.role === 'Supervisor' ? '#8b5cf6' : '#667eea',
                                  fontWeight: 600
                                }} 
                              />
                            </TableCell>
                            <TableCell>{user.office || 'N/A'}</TableCell>
                            <TableCell>{user.bloodGroup || 'N/A'}</TableCell>
                            <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.isActive ? 'Active' : 'Inactive'} 
                                size="small"
                                color={user.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleEditUser(user)}
                                sx={{ mr: 1 }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                              <Switch
                                checked={user.isActive}
                                onChange={() => handleToggleStatus(user.id, user.isActive)}
                                color="primary"
                                size="small"
                                sx={{ ml: 1 }}
                              />
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
        </Box>
      </Paper>
    </Box>
  );
};

export default ModernUserManagement;