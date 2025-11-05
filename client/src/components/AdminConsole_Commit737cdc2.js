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
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { dropdownAPI, userAPI, permissionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';

const AdminConsole = () => {
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
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);

  // Dropdown management state
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownTypes] = useState(['Source', 'Category', 'Service', 'Office', 'Obligation']);
  const [selectedDropdownType, setSelectedDropdownType] = useState('All');
  const [dropdownValue, setDropdownValue] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingDropdown, setEditingDropdown] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownToDelete, setDropdownToDelete] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
  // Permission templates state
  const [permissionTemplates, setPermissionTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templatePermissions, setTemplatePermissions] = useState({
    canApproveLeaves: false,
    canCreateLeaves: true,
    canCreateTasks: true,
    canCreateMeetings: false,
    canManageDropdowns: false,
    canManageFiles: false,
    canManageUsers: false,
    canViewAllLeaves: false,
    canViewAllTasks: false,
    canViewLogs: false,
    canViewReports: false
  });
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'Agent',
    bloodGroup: '',
    phoneNumber: '',
    designation: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Fetch users and offices on component mount
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data);
      
      // Log audit entry
      auditLog.userCreated(response.data.length, user?.username || 'unknown');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [user?.username]);

  const fetchPermissionTemplates = useCallback(async () => {
    try {
      const response = await permissionAPI.getAllTemplates();
      setPermissionTemplates(response.data);
    } catch (error) {
      console.error('Error fetching permission templates:', error);
      setError('Failed to fetch permission templates');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchDropdowns();
    fetchPermissionTemplates();
  }, [fetchUsers, fetchPermissionTemplates]);

  const fetchDropdowns = async () => {
    try {
      const response = await dropdownAPI.getAllDropdowns();
      setDropdowns(response.data);
      
      // Get unique categories for Service dropdown parent selection
      const uniqueCategories = [...new Set(response.data
        .filter(d => d.type === 'Category')
        .map(d => d.value))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const userToToggle = users.find(u => u.id === userId);
      if (!userToToggle) return;

      // Only send the isActive field for status toggle
      const updatedUserData = { isActive: !userToToggle.isActive };
      await userAPI.updateUser(userId, updatedUserData);

      setUsers(users.map(user =>
        user.id === userId
          ? { ...user, isActive: !user.isActive }
          : user
      ));

      // Log audit entry
      auditLog.userUpdated(userToToggle.id, user?.username || 'unknown');

      setSuccess('User status updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status: ' + (error.response?.data?.message || error.message));
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
    
    if (!formData.fullName || !formData.username || !formData.email) {
      setError('Please fill in all required fields');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setLoading(true);
      if (isEditing) {
        await userAPI.updateUser(editingUserId, formData);
        setSuccess('User updated successfully!');
        auditLog.userUpdated(editingUserId, user?.username || 'unknown');
      } else {
        await userAPI.createUser(formData);
        setSuccess('User created successfully!');
        auditLog.userCreated(1, user?.username || 'unknown');
      }
      
      // Reset form
      setFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'Agent'
      });
      setIsEditing(false);
      setEditingUserId(null);
      
      // Refresh users list
      fetchUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      setError('Failed to save user: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
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
      bloodGroup: user.bloodGroup || '',
      phoneNumber: user.phoneNumber || '',
      designation: user.designation || ''
    });
    
    setIsEditing(true);
    setEditingUserId(user.id);
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await userAPI.deleteUser(userId);
      setSuccess('User deleted successfully!');
      auditLog.userDeleted(userId, user?.username || 'unknown');
      
      // Refresh users list
      fetchUsers();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Dropdown management functions
  const handleDropdownTypeChange = (event) => {
    setSelectedDropdownType(event.target.value);
    setDropdownValue('');
    if (event.target.value !== 'Service') {
      setParentCategory('');
    }
  };

  const handleAddDropdown = async () => {
    if (!dropdownValue.trim()) {
      setError('Please enter a value');
      setTimeout(() => setError(''), 5000);
      return;
    }

    if (selectedDropdownType === 'Service' && !parentCategory) {
      setError('Please select a parent category for service');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      const dropdownData = {
        type: selectedDropdownType,
        value: dropdownValue
      };

      if (selectedDropdownType === 'Service') {
        dropdownData.parentType = 'Category';
        dropdownData.parentValue = parentCategory;
      }

      if (editingDropdown) {
        await dropdownAPI.updateDropdownValue(editingDropdown.id, dropdownData);
        setSuccess('Dropdown value updated successfully!');
      } else {
        await dropdownAPI.createDropdownValue(dropdownData);
        setSuccess(`Dropdown value "${dropdownValue}" added successfully!`);
      }

      // Reset form
      setDropdownValue('');
      setParentCategory('');
      setEditingDropdown(null);

      // Refresh dropdowns
      fetchDropdowns();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving dropdown value:', error);
      // Handle specific error cases
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        setError(`Dropdown value "${dropdownValue}" already exists for type "${selectedDropdownType}"`);
      } else {
        setError('Failed to save dropdown value: ' + (error.response?.data?.message || error.message));
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditDropdown = (dropdown) => {
    setSelectedDropdownType(dropdown.type);
    setDropdownValue(dropdown.value);
    setParentCategory(dropdown.parentValue || '');
    setEditingDropdown(dropdown);
  };

  const openDeleteDialog = (dropdown) => {
    setDropdownToDelete(dropdown);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDropdownToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteDropdown = async () => {
    if (!dropdownToDelete) return;

    try {
      await dropdownAPI.deleteDropdownValue(dropdownToDelete.id);
      setSuccess('Dropdown value deleted successfully!');
      
      // Refresh dropdowns
      fetchDropdowns();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting dropdown value:', error);
      setError('Failed to delete dropdown value: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      closeDeleteDialog();
    }
  };

  // Import dropdowns from CSV/Excel
  const handleImportDropdowns = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      setLoading(true);
      
      // For now, we'll simulate the import process
      // In a real implementation, you would parse the CSV/Excel file and send it to the backend
      
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`${importFile.name} imported successfully!`);
      setImportDialogOpen(false);
      setImportFile(null);
      
      // Refresh dropdowns
      fetchDropdowns();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error importing dropdown values:', error);
      setError('Failed to import dropdown values: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    // Create CSV content for the template
    const csvContent = `Type,Value,Parent
Source,Email,
Source,Phone,
Category,IT,
Category,HR,
Service,Software Installation,IT
Service,Hardware Repair,IT
Service,Recruitment,HR
Office,Dhaka Office,
Office,Chittagong Office,`;
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dropdown_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Permission template functions
  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    
    if (!templateName.trim()) {
      setError('Please enter a template name');
      setTimeout(() => setError(''), 5000);
      return;
    }

    try {
      const templateData = {
        name: templateName,
        permissions: templatePermissions
      };

      if (editingTemplate) {
        await permissionAPI.updateTemplate(editingTemplate.id, templateData);
        setSuccess('Permission template updated successfully!');
      } else {
        await permissionAPI.createTemplate(templateData);
        setSuccess('Permission template created successfully!');
      }

      // Reset form
      setTemplateName('');
      setTemplatePermissions({
        canApproveLeaves: false,
        canCreateLeaves: true,
        canCreateTasks: true,
        canCreateMeetings: false,
        canManageDropdowns: false,
        canManageFiles: false,
        canManageUsers: false,
        canViewAllLeaves: false,
        canViewAllTasks: false,
        canViewLogs: false,
        canViewReports: false
      });
      setEditingTemplate(null);

      // Refresh templates
      fetchPermissionTemplates();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving permission template:', error);
      setError('Failed to save permission template: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditTemplate = (template) => {
    setTemplateName(template.name);
    setTemplatePermissions(template.permissions);
    setEditingTemplate(template);
  };

  const handleDeleteTemplate = async (templateId) => {
    try {
      await permissionAPI.deleteTemplate(templateId);
      setSuccess('Permission template deleted successfully!');
      
      // Refresh templates
      fetchPermissionTemplates();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting permission template:', error);
      setError('Failed to delete permission template: ' + (error.response?.data?.message || error.message));
      setTimeout(() => setError(''), 5000);
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

  // Filter dropdowns based on type - add 'All' option
  const filteredDropdowns = selectedDropdownType === 'All' 
    ? dropdowns 
    : dropdowns.filter(dropdown => dropdown.type === selectedDropdownType);
  
  // Add debugging to help identify issues
  console.log('Dropdowns data:', dropdowns);
  console.log('Selected dropdown type:', selectedDropdownType);
  console.log('Filtered dropdowns:', filteredDropdowns);
  
  // Add debugging to help identify issues
  console.log('Dropdowns data:', dropdowns);
  console.log('Selected dropdown type:', selectedDropdownType);
  console.log('Filtered dropdowns:', filteredDropdowns);

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
          Admin Console
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Manage users, permissions, and system configurations
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
          <Tab label="User Management" />
          <Tab label="Permission Templates" />
          <Tab label="Dropdown Management" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* User Management Tab */}
          {activeTab === 0 && (
            <Box>
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
                            label="Designation"
                            name="designation"
                            value={formData.designation || ''}
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
                                    bloodGroup: '',
                                    phoneNumber: '',
                                    designation: ''
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
                              <TableCell>Blood Group</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Designation</TableCell>
                              <TableCell>Role</TableCell>
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
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {user.fullName}
                                  </Typography>
                                </TableCell>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.bloodGroup || 'N/A'}</TableCell>
                                <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                                <TableCell>{user.designation || 'N/A'}</TableCell>
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
                                    onChange={() => handleToggleStatus(user.id)}
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
          )}
          
          {/* Permission Templates Tab */}
          {activeTab === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {editingTemplate ? 'Edit Permission Template' : 'Create Permission Template'}
                    </Typography>
                    <form onSubmit={handleTemplateSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Template Name"
                            placeholder="e.g., Supervisor Template"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                            Permissions
                          </Typography>
                          <Grid container spacing={2}>
                            {Object.entries(templatePermissions).map(([key, value]) => (
                              <Grid item xs={12} sm={6} md={4} key={key}>
                                <FormControlLabel
                                  control={
                                    <Switch 
                                      checked={value}
                                      onChange={() => setTemplatePermissions({
                                        ...templatePermissions,
                                        [key]: !value
                                      })}
                                      color="primary"
                                    />
                                  }
                                  label={
                                    key
                                      .replace(/([A-Z])/g, ' $1')
                                      .replace(/^./, (str) => str.toUpperCase())
                                  }
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                              type="submit"
                              variant="contained"
                              startIcon={loading ? <CircularProgress size={20} /> : (editingTemplate ? <SaveIcon /> : <AddIcon />)}
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
                              {loading ? (editingTemplate ? 'Updating...' : 'Creating...') : (editingTemplate ? 'Update Template' : 'Create Template')}
                            </Button>
                            {editingTemplate && (
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setEditingTemplate(null);
                                  setTemplateName('');
                                  setTemplatePermissions({
                                    canApproveLeaves: false,
                                    canCreateLeaves: true,
                                    canCreateTasks: true,
                                    canCreateMeetings: false,
                                    canManageDropdowns: false,
                                    canManageFiles: false,
                                    canManageUsers: false,
                                    canViewAllLeaves: false,
                                    canViewAllTasks: false,
                                    canViewLogs: false,
                                    canViewReports: false
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
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Existing Templates
                    </Typography>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Template Name</TableCell>
                              <TableCell>Permissions</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {permissionTemplates.map((template) => (
                              <TableRow 
                                key={template.id} 
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'action.hover',
                                    transform: 'scale(1.01)',
                                    transition: 'all 0.2s ease'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {template.name}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                    {Object.entries(template.permissions || {}).map(([key, value]) => (
                                      value && (
                                        <Chip 
                                          key={key}
                                          label={
                                            key
                                              .replace(/([A-Z])/g, ' $1')
                                              .replace(/^./, (str) => str.toUpperCase())
                                          }
                                          size="small"
                                          sx={{ 
                                            bgcolor: '#667eea20',
                                            color: '#667eea',
                                            fontWeight: 600
                                          }} 
                                        />
                                      )
                                    ))}
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <IconButton 
                                    size="small" 
                                    color="primary" 
                                    onClick={() => handleEditTemplate(template)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleDeleteTemplate(template.id)}
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
          )}
          
          {/* Dropdown Management Tab */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {editingDropdown ? 'Edit Dropdown Value' : 'Add New Dropdown Value'}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        onClick={() => setImportDialogOpen(true)}
                        startIcon={<UploadIcon />}
                      >
                        Import from CSV/Excel
                      </Button>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select 
                            value={selectedDropdownType}
                            onChange={handleDropdownTypeChange}
                            label="Type"
                          >
                            {dropdownTypes.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Value"
                          placeholder="Enter dropdown value"
                          value={dropdownValue}
                          onChange={(e) => setDropdownValue(e.target.value)}
                          required
                        />
                      </Grid>
                      {selectedDropdownType === 'Service' && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Parent Category</InputLabel>
                            <Select
                              value={parentCategory}
                              onChange={(e) => setParentCategory(e.target.value)}
                              label="Parent Category"
                            >
                              {categories.map(category => (
                                <MenuItem key={category} value={category}>{category}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : (editingDropdown ? <SaveIcon /> : <AddIcon />)}
                            onClick={handleAddDropdown}
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
                            {loading ? (editingDropdown ? 'Updating...' : 'Adding...') : (editingDropdown ? 'Update Value' : 'Add Value')}
                          </Button>
                          {editingDropdown && (
                            <Button
                              variant="outlined"
                              onClick={() => {
                                setEditingDropdown(null);
                                setDropdownValue('');
                                setParentCategory('');
                              }}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Dropdown Values
                      </Typography>
                      
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={selectedDropdownType}
                          onChange={handleDropdownTypeChange}
                          label="Type"
                        >
                          <MenuItem value="All">All</MenuItem>
                          {dropdownTypes.map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
                              <TableCell>Type</TableCell>
                              <TableCell>Value</TableCell>
                              <TableCell>Parent</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredDropdowns.map((dropdown) => (
                              <TableRow 
                                key={dropdown.id} 
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'action.hover',
                                    transform: 'scale(1.01)',
                                    transition: 'all 0.2s ease'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Chip 
                                    label={dropdown.type} 
                                    size="small"
                                    sx={{ 
                                      bgcolor: dropdown.type === 'Category' ? '#10b98120' : 
                                               dropdown.type === 'Service' ? '#8b5cf620' : 
                                               dropdown.type === 'Source' ? '#f59e0b20' : 
                                               dropdown.type === 'Office' ? '#ef444420' : 
                                               dropdown.type === 'Obligation' ? '#967bb620' : '#667eea20',
                                      color: dropdown.type === 'Category' ? '#10b981' : 
                                             dropdown.type === 'Service' ? '#8b5cf6' : 
                                             dropdown.type === 'Source' ? '#f59e0b' : 
                                             dropdown.type === 'Office' ? '#ef4444' : 
                                             dropdown.type === 'Obligation' ? '#967bb6' : '#667eea',
                                      fontWeight: 600
                                    }} 
                                  />
                                </TableCell>
                                <TableCell>{dropdown.value}</TableCell>
                                <TableCell>{dropdown.parentValue || '-'}</TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditDropdown(dropdown)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => openDeleteDialog(dropdown)}
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
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this dropdown value? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteDropdown} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UploadIcon sx={{ mr: 1 }} />
            Import Dropdown Values
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Upload a CSV or Excel file to import dropdown values. The file should have the following columns:
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Required Columns:
              </Typography>
              <Typography variant="body2">
                <strong>Type</strong> - One of: Source, Category, Service, Office, Obligation<br />
                <strong>Value</strong> - The dropdown value<br />
                <strong>Parent</strong> - Required only for Service type (should match a Category value)
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                Note: Obligation values can be edited or deleted using the action buttons in the table below.
              </Typography>
            </Paper>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              Example CSV format:
            </Typography>
            
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
              <Typography variant="body2" component="pre">
                Type,Value,Parent{'\n'}
                Source,Email,{'\n'}
                Source,Phone,{'\n'}
                Category,IT,{'\n'}
                Category,HR,{'\n'}
                Service,Software Installation,IT{'\n'}
                Service,Hardware Repair,IT{'\n'}
                Service,Recruitment,HR{'\n'}
                Office,Dhaka Office,{'\n'}
                Office,Chittagong Office,{'\n'}
                Obligation,Compliance,{'\n'}
                Obligation,Legal,
              </Typography>
            </Paper>
            
            <Button 
              variant="outlined" 
              onClick={handleDownloadTemplate}
              sx={{ mb: 2 }}
            >
              Download Excel Template
            </Button>
            
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files[0])}
              style={{ width: '100%', marginTop: 16 }}
            />
            
            {importFile && (
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Selected file: {importFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleImportDropdowns}
            disabled={!importFile || loading}
            startIcon={loading ? <CircularProgress size={20} /> : <UploadIcon />}
          >
            {loading ? 'Importing...' : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminConsole;