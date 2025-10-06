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
  CircularProgress,
  Snackbar,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  ListAlt as ListAltIcon,
  AdminPanelSettings,
  Business as BusinessIcon,
  Category as CategoryIcon,
  Source as SourceIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { dropdownAPI, userAPI, permissionAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

const UserManagement = () => {
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
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  
  // Dialog states
  const [dialogs, setDialogs] = useState({
    userCreate: { open: false },
    userEdit: { open: false, user: null },
    userDelete: { open: false, user: null },
    dropdownCreate: { open: false },
    dropdownEdit: { open: false, dropdown: null },
    dropdownDelete: { open: false, dropdown: null },
    templateCreate: { open: false },
    templateEdit: { open: false, template: null },
    templateDelete: { open: false, template: null }
  });
  
  // Form state for users
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'Agent',
    office: '',
    isActive: true
  });
  
  // Dropdown management state
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownTypes] = useState([
    { value: 'Category', label: 'Category', icon: <CategoryIcon /> },
    { value: 'Service', label: 'Service', icon: <BuildIcon /> },
    { value: 'Source', label: 'Source', icon: <SourceIcon /> },
    { value: 'Office', label: 'Office', icon: <BusinessIcon /> }
  ]);
  const [selectedDropdownType, setSelectedDropdownType] = useState('Category');
  const [dropdownValue, setDropdownValue] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [dropdownFormData, setDropdownFormData] = useState({
    type: 'Category',
    value: '',
    parentType: '',
    parentValue: '',
    isActive: true
  });
  
  // Permission templates state
  const [permissionTemplates, setPermissionTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [templatePermissions, setTemplatePermissions] = useState({
    canCreateTasks: false,
    canAssignTasks: false,
    canViewAllTasks: false,
    canCreateLeaves: false,
    canApproveLeaves: false,
    canViewAllLeaves: false,
    canManageUsers: false,
    canManageDropdowns: false,
    canViewReports: false,
    canManageFiles: false,
    canViewLogs: false
  });

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setDataLoading(true);
    setError('');
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users. Please try again.';
      setError(errorMessage);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch permission templates
  const fetchPermissionTemplates = useCallback(async () => {
    try {
      const response = await permissionAPI.getAllTemplates();
      setPermissionTemplates(response.data || []);
    } catch (error) {
      console.error('Error fetching permission templates:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch permission templates. Please try again.';
      setError(errorMessage);
    }
  }, []);

  // Fetch offices
  const fetchOffices = async () => {
    try {
      const response = await dropdownAPI.getDropdownValues('Office');
      setOffices(response.data || []);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

  // Fetch dropdowns
  const fetchDropdowns = async () => {
    try {
      const response = await dropdownAPI.getAllDropdowns();
      setDropdowns(response.data || []);
      
      // Get unique categories for Service dropdown parent selection
      const uniqueCategories = [...new Set((response.data || [])
        .filter(d => d.type === 'Category' && d.isActive)
        .map(d => d.value))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dropdown values. Please try again.';
      setError(errorMessage);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchUsers();
    fetchOffices();
    fetchDropdowns();
    fetchPermissionTemplates();
  }, [fetchUsers, fetchPermissionTemplates]);

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

    const handleDropdownCreated = (data) => {
      setSuccess('New dropdown value created successfully!');
      fetchDropdowns(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleDropdownUpdated = (data) => {
      setSuccess('Dropdown value updated successfully!');
      fetchDropdowns(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleDropdownDeleted = (data) => {
      setSuccess('Dropdown value deleted successfully!');
      fetchDropdowns(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleTemplateCreated = (data) => {
      setSuccess('New permission template created successfully!');
      fetchPermissionTemplates(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleTemplateUpdated = (data) => {
      setSuccess('Permission template updated successfully!');
      fetchPermissionTemplates(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleTemplateDeleted = (data) => {
      setSuccess('Permission template deleted successfully!');
      fetchPermissionTemplates(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    // Subscribe to notifications
    notificationService.onUserCreated(handleUserCreated);
    notificationService.onUserUpdated(handleUserUpdated);
    notificationService.onUserDeleted(handleUserDeleted);
    notificationService.onDropdownCreated(handleDropdownCreated);
    notificationService.onDropdownUpdated(handleDropdownUpdated);
    notificationService.onDropdownDeleted(handleDropdownDeleted);
    notificationService.onPermissionTemplateCreated(handleTemplateCreated);
    notificationService.onPermissionTemplateUpdated(handleTemplateUpdated);
    notificationService.onPermissionTemplateDeleted(handleTemplateDeleted);

    // Cleanup on unmount
    return () => {
      notificationService.off('userCreated', handleUserCreated);
      notificationService.off('userUpdated', handleUserUpdated);
      notificationService.off('userDeleted', handleUserDeleted);
      notificationService.off('dropdownCreated', handleDropdownCreated);
      notificationService.off('dropdownUpdated', handleDropdownUpdated);
      notificationService.off('dropdownDeleted', handleDropdownDeleted);
      notificationService.off('permissionTemplateCreated', handleTemplateCreated);
      notificationService.off('permissionTemplateUpdated', handleTemplateUpdated);
      notificationService.off('permissionTemplateDeleted', handleTemplateDeleted);
    };
  }, [fetchUsers, fetchDropdowns, fetchPermissionTemplates]);

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

  const openDialog = (dialogType, data = null) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: true, ...data }
    }));
    
    // Pre-populate forms based on dialog type
    if (dialogType === 'userEdit' && data?.user) {
      setUserFormData({
        fullName: data.user.fullName || '',
        username: data.user.username || '',
        email: data.user.email || '',
        password: '',
        role: data.user.role || 'Agent',
        office: data.user.office || '',
        isActive: data.user.isActive !== undefined ? data.user.isActive : true
      });
      
      // Find office in offices array
      const office = offices.find(o => o.value === data.user.office);
      setSelectedOffice(office || null);
    } else if (dialogType === 'userCreate') {
      // Reset user form
      setUserFormData({
        fullName: '',
        username: '',
        email: '',
        password: '',
        role: 'Agent',
        office: '',
        isActive: true
      });
      setSelectedOffice(null);
    } else if (dialogType === 'dropdownEdit' && data?.dropdown) {
      setDropdownFormData({
        type: data.dropdown.type,
        value: data.dropdown.value,
        parentType: data.dropdown.parentType || '',
        parentValue: data.dropdown.parentValue || '',
        isActive: data.dropdown.isActive !== undefined ? data.dropdown.isActive : true
      });
      setSelectedDropdownType(data.dropdown.type);
      setParentCategory(data.dropdown.parentValue || '');
    } else if (dialogType === 'dropdownCreate') {
      // Reset dropdown form
      setDropdownFormData({
        type: 'Category',
        value: '',
        parentType: '',
        parentValue: '',
        isActive: true
      });
      setSelectedDropdownType('Category');
      setParentCategory('');
    } else if (dialogType === 'templateEdit' && data?.template) {
      setTemplateName(data.template.name);
      setTemplatePermissions(data.template.permissions || {
        canCreateTasks: false,
        canAssignTasks: false,
        canViewAllTasks: false,
        canCreateLeaves: false,
        canApproveLeaves: false,
        canViewAllLeaves: false,
        canManageUsers: false,
        canManageDropdowns: false,
        canViewReports: false,
        canManageFiles: false,
        canViewLogs: false
      });
    } else if (dialogType === 'templateCreate') {
      // Reset template form
      setTemplateName('');
      setTemplatePermissions({
        canCreateTasks: false,
        canAssignTasks: false,
        canViewAllTasks: false,
        canCreateLeaves: false,
        canApproveLeaves: false,
        canViewAllLeaves: false,
        canManageUsers: false,
        canManageDropdowns: false,
        canViewReports: false,
        canManageFiles: false,
        canViewLogs: false
      });
    }
  };

  const closeDialog = (dialogType) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: false }
    }));
  };

  const closeAllDialogs = () => {
    setDialogs({
      userCreate: { open: false },
      userEdit: { open: false, user: null },
      userDelete: { open: false, user: null },
      dropdownCreate: { open: false },
      dropdownEdit: { open: false, dropdown: null },
      dropdownDelete: { open: false, dropdown: null },
      templateCreate: { open: false },
      templateEdit: { open: false, template: null },
      templateDelete: { open: false, template: null }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // User management handlers
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData({
      ...userFormData,
      [name]: value
    });
  };

  const handleUserSwitchChange = (e) => {
    setUserFormData({
      ...userFormData,
      isActive: e.target.checked
    });
  };

  const handleOfficeChange = (event, newValue) => {
    setSelectedOffice(newValue);
    setUserFormData({
      ...userFormData,
      office: newValue ? newValue.value : ''
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!userFormData.fullName || !userFormData.username || !userFormData.email) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (dialogs.userEdit.user) {
        // Update existing user
        const response = await userAPI.updateUser(dialogs.userEdit.user.id, {
          fullName: userFormData.fullName,
          username: userFormData.username,
          email: userFormData.email,
          role: userFormData.role,
          office: userFormData.office,
          isActive: userFormData.isActive
        });
        
        showSnackbar('User updated successfully!', 'success');
      } else {
        // Create new user
        const response = await userAPI.createUser({
          fullName: userFormData.fullName,
          username: userFormData.username,
          email: userFormData.email,
          password: userFormData.password,
          role: userFormData.role,
          office: userFormData.office,
          isActive: userFormData.isActive
        });
        
        showSnackbar('User created successfully!', 'success');
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
      await userAPI.deleteUser(dialogs.userDelete.user.id);
      showSnackbar('User deleted successfully!', 'success');
      closeDialog('userDelete');
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error deleting user';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setLoading(true);
      const userToUpdate = users.find(u => u.id === userId);
      const response = await userAPI.updateUser(userId, {
        ...userToUpdate,
        isActive: !currentStatus
      });
      
      showSnackbar(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating user status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error updating user status';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dropdown management handlers
  const handleDropdownTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedDropdownType(newType);
    setDropdownFormData({
      ...dropdownFormData,
      type: newType,
      parentType: newType === 'Service' ? 'Category' : '',
      parentValue: newType === 'Service' ? parentCategory : ''
    });
    
    // Reset parent category when changing type
    if (newType !== 'Service') {
      setParentCategory('');
    }
  };

  const handleDropdownInputChange = (e) => {
    const { name, value } = e.target;
    setDropdownFormData({
      ...dropdownFormData,
      [name]: value
    });
  };

  const handleDropdownSwitchChange = (e) => {
    setDropdownFormData({
      ...dropdownFormData,
      isActive: e.target.checked
    });
  };

  const handleParentCategoryChange = (e) => {
    const newValue = e.target.value;
    setParentCategory(newValue);
    setDropdownFormData({
      ...dropdownFormData,
      parentValue: newValue
    });
  };

  const handleDropdownSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!dropdownFormData.value) {
      showSnackbar('Please enter a value', 'error');
      return;
    }
    
    if (dropdownFormData.type === 'Service' && !dropdownFormData.parentValue) {
      showSnackbar('Please select a parent category for service', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (dialogs.dropdownEdit.dropdown) {
        // Update existing dropdown
        const response = await dropdownAPI.updateDropdownValue(dialogs.dropdownEdit.dropdown.id, {
          type: dropdownFormData.type,
          value: dropdownFormData.value,
          parentType: dropdownFormData.type === 'Service' ? dropdownFormData.parentType : undefined,
          parentValue: dropdownFormData.type === 'Service' ? dropdownFormData.parentValue : undefined,
          isActive: dropdownFormData.isActive
        });
        
        showSnackbar('Dropdown value updated successfully!', 'success');
      } else {
        // Create new dropdown
        const response = await dropdownAPI.createDropdownValue({
          type: dropdownFormData.type,
          value: dropdownFormData.value,
          parentType: dropdownFormData.type === 'Service' ? dropdownFormData.parentType : undefined,
          parentValue: dropdownFormData.type === 'Service' ? dropdownFormData.parentValue : undefined
        });
        
        showSnackbar('Dropdown value created successfully!', 'success');
      }
      
      closeAllDialogs();
      fetchDropdowns(); // Refresh data
    } catch (error) {
      console.error('Error saving dropdown value:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error saving dropdown value';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDropdown = async () => {
    try {
      setLoading(true);
      await dropdownAPI.deleteDropdownValue(dialogs.dropdownDelete.dropdown.id);
      showSnackbar('Dropdown value deleted successfully!', 'success');
      closeDialog('dropdownDelete');
      fetchDropdowns(); // Refresh data
    } catch (error) {
      console.error('Error deleting dropdown value:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error deleting dropdown value';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Permission template handlers
  const handleTemplateNameChange = (e) => {
    setTemplateName(e.target.value);
  };

  const handlePermissionChange = (permission) => {
    setTemplatePermissions({
      ...templatePermissions,
      [permission]: !templatePermissions[permission]
    });
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showSnackbar('Template name is required', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const templateData = {
        name: templateName.trim(),
        permissions: { ...templatePermissions }
      };

      if (dialogs.templateEdit.template) {
        // Update existing template
        const response = await permissionAPI.updateTemplate(dialogs.templateEdit.template.id, templateData);
        showSnackbar('Permission template updated successfully!', 'success');
      } else {
        // Create new template
        const response = await permissionAPI.createTemplate(templateData);
        showSnackbar('Permission template created successfully!', 'success');
      }

      closeAllDialogs();
      fetchPermissionTemplates(); // Refresh data
    } catch (error) {
      console.error('Error saving permission template:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error saving permission template';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      setLoading(true);
      await permissionAPI.deleteTemplate(dialogs.templateDelete.template.id);
      showSnackbar('Permission template deleted successfully!', 'success');
      closeDialog('templateDelete');
      fetchPermissionTemplates(); // Refresh data
    } catch (error) {
      console.error('Error deleting permission template:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error deleting permission template';
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

  // Filter dropdowns based on selected type
  const filteredDropdowns = dropdowns.filter(d => d.type === selectedDropdownType);

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
            Admin Console
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Manage users, permissions, and system configurations
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{success}</Alert>
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
            <Tab icon={<PeopleIcon />} iconPosition="start" label="User Management" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Permission Templates" />
            <Tab icon={<ListAltIcon />} iconPosition="start" label="Dropdown Management" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {/* User Management Tab */}
            {activeTab === 0 && (
              <Box>
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
                            onClick={() => openDialog('userCreate')}
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
                                          onChange={() => handleToggleUserStatus(u.id, u.isActive)}
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
                                      onClick={() => openDialog('userEdit', { user: u })}
                                      sx={{ mr: 1 }}
                                      disabled={loading}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={() => openDialog('userDelete', { user: u })}
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
              </Box>
            )}
            
            {/* Permission Templates Tab */}
            {activeTab === 1 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Create Permission Template
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Template Name"
                            placeholder="e.g., Supervisor Template"
                            value={templateName}
                            onChange={handleTemplateNameChange}
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
                                      onChange={() => handlePermissionChange(key)}
                                      color="primary"
                                    />
                                  }
                                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                              onClick={handleSaveTemplate}
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
                              {loading ? (dialogs.templateEdit.template ? 'Updating...' : 'Creating...') : (dialogs.templateEdit.template ? 'Update Template' : 'Create Template')}
                            </Button>
                            <Button 
                              variant="outlined"
                              onClick={() => openDialog(dialogs.templateEdit.template ? 'templateEdit' : 'templateCreate')}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Existing Templates
                      </Typography>
                      {dataLoading ? (
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
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                      {template.permissions && Object.entries(template.permissions).map(([key, value]) => (
                                        value && (
                                          <Chip 
                                            key={key}
                                            label={key.replace(/([A-Z])/g, ' $1').trim()}
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
                                      onClick={() => openDialog('templateEdit', { template })}
                                      sx={{ mr: 1 }}
                                      disabled={loading}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={() => openDialog('templateDelete', { template })}
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
              </Box>
            )}
            
            {/* Dropdown Management Tab */}
            {activeTab === 2 && (
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Add New Dropdown Value
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select 
                              value={dropdownFormData.type}
                              onChange={handleDropdownTypeChange}
                              label="Type"
                            >
                              {dropdownTypes.map(type => (
                                <MenuItem key={type.value} value={type.value}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {type.icon}
                                    <span style={{ marginLeft: 8 }}>{type.label}</span>
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Value"
                            placeholder="Enter dropdown value"
                            value={dropdownFormData.value}
                            onChange={handleDropdownInputChange}
                            name="value"
                            required
                          />
                        </Grid>
                        {dropdownFormData.type === 'Service' && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Parent Category</InputLabel>
                              <Select 
                                value={dropdownFormData.parentValue}
                                onChange={handleParentCategoryChange}
                                label="Parent Category"
                              >
                                <MenuItem value="">Select category first</MenuItem>
                                {categories.map(category => (
                                  <MenuItem key={category} value={category}>{category}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={dropdownFormData.isActive}
                                onChange={handleDropdownSwitchChange}
                                color="primary"
                              />
                            }
                            label="Active"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                              onClick={handleDropdownSubmit}
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
                              {loading ? (dialogs.dropdownEdit.dropdown ? 'Updating...' : 'Creating...') : (dialogs.dropdownEdit.dropdown ? 'Update Value' : 'Add Value')}
                            </Button>
                            <Button 
                              variant="outlined"
                              onClick={() => openDialog(dialogs.dropdownEdit.dropdown ? 'dropdownEdit' : 'dropdownCreate')}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Manage Dropdown Values
                        </Typography>
                        <FormControl sx={{ minWidth: 120 }} size="small">
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={selectedDropdownType}
                            onChange={(e) => setSelectedDropdownType(e.target.value)}
                            label="Type"
                          >
                            {dropdownTypes.map(type => (
                              <MenuItem key={type.value} value={type.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {type.icon}
                                  <span style={{ marginLeft: 8 }}>{type.label}</span>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
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
                                <TableCell>Type</TableCell>
                                <TableCell>Value</TableCell>
                                <TableCell>Parent</TableCell>
                                <TableCell>Status</TableCell>
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
                                      icon={dropdownTypes.find(t => t.value === dropdown.type)?.icon}
                                      label={dropdown.type}
                                      size="small"
                                      sx={{ 
                                        bgcolor: dropdown.type === 'Category' ? '#f093fb20' : 
                                                dropdown.type === 'Service' ? '#667eea20' : 
                                                dropdown.type === 'Source' ? '#f59e0b20' : 
                                                '#3b82f620',
                                        color: dropdown.type === 'Category' ? '#f093fb' : 
                                              dropdown.type === 'Service' ? '#667eea' : 
                                              dropdown.type === 'Source' ? '#f59e0b' : 
                                              '#3b82f6',
                                        fontWeight: 600
                                      }} 
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                      {dropdown.value}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {dropdown.parentValue ? (
                                      <Typography variant="body2">
                                        {dropdown.parentValue}
                                      </Typography>
                                    ) : (
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        N/A
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={dropdown.isActive ? 'Active' : 'Inactive'}
                                      size="small"
                                      sx={{ 
                                        bgcolor: dropdown.isActive ? '#10b98120' : '#ef444420',
                                        color: dropdown.isActive ? '#10b981' : '#ef4444',
                                        fontWeight: 600
                                      }} 
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <IconButton 
                                      size="small" 
                                      color="primary" 
                                      onClick={() => openDialog('dropdownEdit', { dropdown })}
                                      sx={{ mr: 1 }}
                                      disabled={loading}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error" 
                                      onClick={() => openDialog('dropdownDelete', { dropdown })}
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
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* User Create/Edit Dialog */}
        <Dialog 
          open={dialogs.userCreate.open || dialogs.userEdit.open} 
          onClose={() => closeDialog(dialogs.userCreate.open ? 'userCreate' : 'userEdit')}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleIcon sx={{ mr: 1, color: 'primary.main' }} />
              {dialogs.userEdit.user ? 'Edit User' : 'Create New User'}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleUserSubmit} sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={userFormData.fullName}
                    onChange={handleUserInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    name="username"
                    value={userFormData.username}
                    onChange={handleUserInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={userFormData.email}
                    onChange={handleUserInputChange}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={dialogs.userEdit.user ? 'New Password (optional)' : 'Password'}
                    name="password"
                    type="password"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    required={!dialogs.userEdit.user}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      name="role"
                      value={userFormData.role}
                      onChange={handleUserInputChange}
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
                  <Autocomplete
                    options={offices}
                    getOptionLabel={(option) => option.value}
                    value={selectedOffice}
                    onChange={handleOfficeChange}
                    renderInput={(params) => (
                      <TextField {...params} label="Office" fullWidth />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userFormData.isActive}
                        onChange={handleUserSwitchChange}
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
            <Button onClick={() => closeDialog(dialogs.userCreate.open ? 'userCreate' : 'userEdit')}>Cancel</Button>
            <Button 
              onClick={handleUserSubmit} 
              variant="contained" 
              startIcon={loading ? <CircularProgress size={20} /> : (dialogs.userEdit.user ? <SaveIcon /> : <AddIcon />)}
              disabled={loading}
            >
              {loading ? (dialogs.userEdit.user ? 'Updating...' : 'Creating...') : (dialogs.userEdit.user ? 'Update User' : 'Create User')}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* User Delete Dialog */}
        <Dialog open={dialogs.userDelete.open} onClose={() => closeDialog('userDelete')}>
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
            {dialogs.userDelete.user && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {dialogs.userDelete.user.fullName} ({dialogs.userDelete.user.username})
                </Typography>
                <Typography variant="caption">
                  {dialogs.userDelete.user.email}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('userDelete')}>Cancel</Button>
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
        
        {/* Dropdown Delete Dialog */}
        <Dialog open={dialogs.dropdownDelete.open} onClose={() => closeDialog('dropdownDelete')}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
              Delete Dropdown Value
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this dropdown value? This action cannot be undone.
            </Typography>
            {dialogs.dropdownDelete.dropdown && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {dialogs.dropdownDelete.dropdown.type}: {dialogs.dropdownDelete.dropdown.value}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('dropdownDelete')}>Cancel</Button>
            <Button 
              onClick={handleDeleteDropdown} 
              variant="contained" 
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Template Delete Dialog */}
        <Dialog open={dialogs.templateDelete.open} onClose={() => closeDialog('templateDelete')}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
              Delete Permission Template
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this permission template? This action cannot be undone.
            </Typography>
            {dialogs.templateDelete.template && (
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  {dialogs.templateDelete.template.name}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('templateDelete')}>Cancel</Button>
            <Button 
              onClick={handleDeleteTemplate} 
              variant="contained" 
              color="error"
              startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar 
          open={!!success || !!error} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={success ? 'success' : 'error'} 
            sx={{ width: '100%' }}
          >
            {success || error}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default UserManagement;