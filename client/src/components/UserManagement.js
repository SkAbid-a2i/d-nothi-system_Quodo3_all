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
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Divider,
  Autocomplete,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { dropdownAPI, userAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { auditLog } from '../services/auditLogger';

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
  const [offices, setOffices] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState(null);
  
  // Dropdown management state
  const [dropdowns, setDropdowns] = useState([]);
  const [dropdownTypes] = useState(['Source', 'Category', 'Service', 'Office']);
  const [selectedDropdownType, setSelectedDropdownType] = useState('Source');
  const [dropdownValue, setDropdownValue] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingDropdown, setEditingDropdown] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownToDelete, setDropdownToDelete] = useState(null);
  
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

  // Fetch users and offices on component mount
  useEffect(() => {
    fetchUsers();
    fetchOffices();
    fetchDropdowns();
  }, []);

  const fetchUsers = async () => {
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
  };

  const fetchOffices = async () => {
    try {
      const response = await dropdownAPI.getDropdownValues('Office');
      setOffices(response.data);
    } catch (error) {
      console.error('Error fetching offices:', error);
    }
  };

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
      
      const updatedUserData = { ...userToToggle, isActive: !userToToggle.isActive };
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
      setError('Failed to update user status');
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

  const handleOfficeChange = (event, newValue) => {
    setSelectedOffice(newValue);
    setFormData({
      ...formData,
      office: newValue ? newValue.value : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (isEditing) {
        // Update existing user
        const response = await userAPI.updateUser(editingUserId, formData);
        
        setUsers(users.map(user => 
          user.id === editingUserId 
            ? { ...user, ...formData }
            : user
        ));
        
        // Log audit entry
        auditLog.userUpdated(editingUserId, user?.username || 'unknown');
        
        setSuccess('User updated successfully!');
      } else {
        // Create new user
        const response = await userAPI.createUser(formData);
        
        const newUser = {
          id: response.data.id,
          ...formData,
          isActive: true
        };
        setUsers([...users, newUser]);
        
        // Log audit entry
        auditLog.userCreated(response.data.id, user?.username || 'unknown');
        
        setSuccess('User created successfully!');
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
      setSelectedOffice(null);
      setIsEditing(false);
      setEditingUserId(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      setError(isEditing ? 'Failed to update user' : 'Failed to create user');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      office: user.office
    });
    
    // Find office in offices array
    const office = offices.find(o => o.value === user.office);
    setSelectedOffice(office || null);
    
    setIsEditing(true);
    setEditingUserId(user.id);
    setActiveTab(0);
  };

  const handleCancel = () => {
    setFormData({
      fullName: '',
      username: '',
      email: '',
      password: '',
      role: 'Agent',
      office: ''
    });
    setSelectedOffice(null);
    setIsEditing(false);
    setEditingUserId(null);
  };

  const handleDelete = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      
      setUsers(users.filter(user => user.id !== userId));
      
      // Log audit entry
      auditLog.userDeleted(userId, user?.username || 'unknown');
      
      setSuccess('User deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Dropdown management functions
  const handleDropdownSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const dropdownData = {
        type: selectedDropdownType,
        value: dropdownValue,
        parentType: selectedDropdownType === 'Service' ? 'Category' : undefined,
        parentValue: selectedDropdownType === 'Service' ? parentCategory : undefined
      };
      
      if (editingDropdown) {
        // Update existing dropdown
        const response = await dropdownAPI.updateDropdownValue(editingDropdown.id, dropdownData);
        
        setDropdowns(dropdowns.map(d => 
          d.id === editingDropdown.id ? response.data : d
        ));
        
        // Log audit entry
        auditLog.dropdownUpdated(editingDropdown.id, user?.username || 'unknown', selectedDropdownType);
        
        setSuccess('Dropdown value updated successfully!');
      } else {
        // Create new dropdown
        const response = await dropdownAPI.createDropdownValue(dropdownData);
        
        setDropdowns([...dropdowns, response.data]);
        
        // Log audit entry
        auditLog.dropdownCreated(response.data.id, user?.username || 'unknown', selectedDropdownType);
        
        setSuccess('Dropdown value created successfully!');
      }
      
      // Reset form
      setDropdownValue('');
      setParentCategory('');
      setEditingDropdown(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving dropdown:', error);
      setError(editingDropdown ? 'Failed to update dropdown value' : 'Failed to create dropdown value');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEditDropdown = (dropdown) => {
    setSelectedDropdownType(dropdown.type);
    setDropdownValue(dropdown.value);
    setParentCategory(dropdown.parentValue || '');
    setEditingDropdown(dropdown);
  };

  const handleDeleteDropdown = async () => {
    try {
      await dropdownAPI.deleteDropdownValue(dropdownToDelete.id);
      
      setDropdowns(dropdowns.filter(d => d.id !== dropdownToDelete.id));
      
      // Log audit entry
      auditLog.dropdownDeleted(dropdownToDelete.id, user?.username || 'unknown', dropdownToDelete.type);
      
      setSuccess('Dropdown value deleted successfully!');
      setDeleteDialogOpen(false);
      setDropdownToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting dropdown:', error);
      setError('Failed to delete dropdown value');
      setDeleteDialogOpen(false);
      setDropdownToDelete(null);
      setTimeout(() => setError(''), 5000);
    }
  };

  const openDeleteDialog = (dropdown) => {
    setDropdownToDelete(dropdown);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDropdownToDelete(null);
  };

  const cancelDropdownEdit = () => {
    setDropdownValue('');
    setParentCategory('');
    setEditingDropdown(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('users.title')}
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('users.userManagement')} />
          <Tab label={t('users.permissionTemplates')} />
          <Tab label={t('users.dropdownManagement')} />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              {loading && (
                <Typography>Loading users...</Typography>
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
              
              <Grid container spacing={3}>
                {/* User Form */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      {isEditing ? t('users.updateUser') : t('users.createNewUser')}
                    </Typography>
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('users.fullName')}
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('users.username')}
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('users.email')}
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
                            label={isEditing ? `${t('settings.newPassword')} (${t('common.optional')})` : t('login.password')}
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={!isEditing}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>{t('users.role')}</InputLabel>
                            <Select
                              name="role"
                              value={formData.role}
                              onChange={handleInputChange}
                              label="Role"
                            >
                              <MenuItem value="Agent">Agent</MenuItem>
                              <MenuItem value="Supervisor">Supervisor</MenuItem>
                              <MenuItem value="Admin">Admin</MenuItem>
                              <MenuItem value="SystemAdmin">System Administrator</MenuItem>
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
                              <TextField {...params} label={t('users.office')} fullWidth />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button 
                              variant="contained" 
                              startIcon={<SaveIcon />} 
                              type="submit"
                            >
                              {isEditing ? t('users.updateUser') : t('users.createUser')}
                            </Button>
                            {isEditing && (
                              <Button 
                                variant="outlined" 
                                startIcon={<CancelIcon />} 
                                onClick={handleCancel}
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
                
                {/* User Filters */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={4}>
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
                          <InputLabel>{t('users.role')}</InputLabel>
                          <Select 
                            label="Role" 
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="Agent">Agent</MenuItem>
                            <MenuItem value="Supervisor">Supervisor</MenuItem>
                            <MenuItem value="Admin">Admin</MenuItem>
                            <MenuItem value="SystemAdmin">System Administrator</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <FormControl fullWidth>
                          <InputLabel>{t('users.status')}</InputLabel>
                          <Select 
                            label="Status" 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button variant="outlined" fullWidth>
                          Filter
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* User List */}
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Full Name</TableCell>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Office</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Chip 
                                label={user.role} 
                                color={
                                  user.role === 'SystemAdmin' ? 'error' : 
                                  user.role === 'Admin' ? 'primary' : 
                                  user.role === 'Supervisor' ? 'secondary' : 'default'
                                } 
                              />
                            </TableCell>
                            <TableCell>{user.office}</TableCell>
                            <TableCell>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={user.isActive}
                                    onChange={() => handleToggleStatus(user.id)}
                                    color="primary"
                                  />
                                }
                                label={user.isActive ? t('users.active') : t('users.inactive')}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" onClick={() => handleEdit(user)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDelete(user.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('users.permissionTemplates')}
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Template Name"
                      placeholder="e.g., Supervisor Template"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Permissions
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label={t('tasks.title')}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label={`${t('common.edit')} ${t('tasks.title')}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label={`${t('common.delete')} ${t('tasks.title')}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label={`${t('common.manage')} ${t('leaves.title')}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label={`${t('common.manage')} ${t('users.title')}`}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControlLabel
                          control={<Switch defaultChecked />}
                          label={`${t('common.manage')} ${t('users.dropdownManagement')}`}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button variant="contained" startIcon={<SaveIcon />}>
                        Save Template
                      </Button>
                      <Button variant="outlined">
                        Cancel
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('users.existingTemplates')}
                  </Typography>
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
                        <TableRow>
                          <TableCell>Admin Template</TableCell>
                          <TableCell>Full Access</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => {
                              // Log audit entry
                              auditLog.userRoleChanged('admin-template', 'template', 'admin', user?.username || 'unknown');
                            }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => {
                              // Log audit entry
                              auditLog.userRoleChanged('admin-template', 'admin', 'deleted', user?.username || 'unknown');
                            }}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Supervisor Template</TableCell>
                          <TableCell>Limited Access</TableCell>
                          <TableCell>
                            <IconButton size="small" onClick={() => {
                              // Log audit entry
                              auditLog.userRoleChanged('supervisor-template', 'template', 'supervisor', user?.username || 'unknown');
                            }}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" onClick={() => {
                              // Log audit entry
                              auditLog.userRoleChanged('supervisor-template', 'supervisor', 'deleted', user?.username || 'unknown');
                            }}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Paper>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('users.dropdownManagement')}
              </Typography>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {t('users.addNewDropdownValue')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('users.dropdownType')}</InputLabel>
                      <Select 
                        value={selectedDropdownType}
                        onChange={(e) => setSelectedDropdownType(e.target.value)}
                        label={t('users.dropdownType')}
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
                      label={t('common.value')}
                      placeholder={t('users.enterDropdownValue')}
                      value={dropdownValue}
                      onChange={(e) => setDropdownValue(e.target.value)}
                    />
                  </Grid>
                  {selectedDropdownType === 'Service' && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>{t('tasks.category')}</InputLabel>
                        <Select 
                          value={parentCategory}
                          onChange={(e) => setParentCategory(e.target.value)}
                          label={t('tasks.category')}
                        >
                          <MenuItem value="">{t('users.selectCategoryFirst')}</MenuItem>
                          {categories.map(category => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )
                  }
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />} 
                        onClick={handleDropdownSubmit}
                      >
                        {editingDropdown ? t('common.edit') : t('common.add')} {t('common.value')}
                      </Button>
                      {editingDropdown && (
                        <Button 
                          variant="outlined" 
                          onClick={cancelDropdownEdit}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {t('users.manageDropdownValues')}
                </Typography>
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
                      {dropdowns.map((dropdown) => (
                        <TableRow key={dropdown.id}>
                          <TableCell>{dropdown.type}</TableCell>
                          <TableCell>{dropdown.value}</TableCell>
                          <TableCell>{dropdown.parentValue || '-'}</TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditDropdown(dropdown)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => openDeleteDialog(dropdown)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>Source</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownUpdated('email', user?.username || 'unknown', 'Source');
                          }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownDeleted('email', user?.username || 'unknown', 'Source');
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>IT Support</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownUpdated('it-support', user?.username || 'unknown', 'Category');
                          }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownDeleted('it-support', user?.username || 'unknown', 'Category');
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>Hardware</TableCell>
                        <TableCell>IT Support</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownUpdated('hardware', user?.username || 'unknown', 'Service');
                          }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownDeleted('hardware', user?.username || 'unknown', 'Service');
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Office</TableCell>
                        <TableCell>Head Office</TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownUpdated('head-office', user?.username || 'unknown', 'Office');
                          }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => {
                            // Log audit entry
                            auditLog.dropdownDeleted('head-office', user?.username || 'unknown', 'Office');
                          }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
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
    </Box>
  );
};

export default UserManagement;
