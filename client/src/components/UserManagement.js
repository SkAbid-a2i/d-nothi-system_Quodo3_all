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
  Autocomplete,
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

const UserManagement = () => {
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
    office: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Mock data for users
  const mockUsers = [
    {
      id: 1,
      fullName: 'John Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      role: 'Admin',
      office: 'Head Office',
      isActive: true,
      createdAt: '2023-01-15T09:30:00Z'
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      username: 'janesmith',
      email: 'jane.smith@example.com',
      role: 'Agent',
      office: 'Branch Office',
      isActive: true,
      createdAt: '2023-02-20T14:15:00Z'
    },
    {
      id: 3,
      fullName: 'Mike Johnson',
      username: 'mikej',
      email: 'mike.johnson@example.com',
      role: 'Supervisor',
      office: 'Head Office',
      isActive: false,
      createdAt: '2023-03-10T11:45:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading users
    setLoading(true);
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    if (severity === 'success') {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setTimeout(() => setError(''), 5000);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.username || !formData.email) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isEditing) {
        // Update existing user
        const updatedUsers = users.map(u => 
          u.id === editingUserId ? { ...u, ...formData } : u
        );
        setUsers(updatedUsers);
        showSnackbar('User updated successfully!', 'success');
      } else {
        // Create new user
        const newUser = {
          id: users.length + 1,
          ...formData,
          createdAt: new Date().toISOString()
        };
        setUsers([newUser, ...users]);
        showSnackbar('User created successfully!', 'success');
      }
      
      // Reset form
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'Agent',
        office: ''
      });
      setIsEditing(false);
      setEditingUserId(null);
    } catch (error) {
      showSnackbar('Error saving user: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      office: user.office
    });
    setIsEditing(true);
    setEditingUserId(user.id);
  };

  const handleDeleteUser = async (userId) => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      showSnackbar('User deleted successfully!', 'success');
    } catch (error) {
      showSnackbar('Error deleting user: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      // Simulate API call
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      );
      
      setUsers(updatedUsers);
      showSnackbar('User status updated successfully!', 'success');
    } catch (error) {
      showSnackbar('Error updating user status: ' + error.message, 'error');
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

        <Grid container spacing={3}>
          {/* User Form */}
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
                  <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {isEditing ? 'Edit User' : 'Create New User'}
                  </Typography>
                </Box>
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
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
                    
                    {!isEditing && (
                      <Grid item xs={12}>
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
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : (isEditing ? <SaveIcon /> : <AddIcon />)}
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
                        {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User')}
                      </Button>
                      
                      {isEditing && (
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={() => {
                            setFormData({
                              fullName: '',
                              username: '',
                              email: '',
                              password: '',
                              role: 'Agent',
                              office: ''
                            });
                            setIsEditing(false);
                            setEditingUserId(null);
                          }}
                          sx={{ mt: 1, py: 1.5 }}
                        >
                          <CancelIcon sx={{ mr: 1 }} />
                          Cancel Edit
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
          
          {/* User List */}
          <Grid item xs={12} lg={8}>
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
                </Box>
              </Box>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              )}
              
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
              )}
              
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
                                  onChange={() => handleToggleStatus(u.id)}
                                  color="primary"
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
                              onClick={() => handleEditUser(u)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteUser(u.id)}
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
      </Box>
    </Fade>
  );
};

export default UserManagement;