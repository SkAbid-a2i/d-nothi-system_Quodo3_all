import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
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
  Snackbar,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { permissionAPI } from '../services/api';
import notificationService from '../services/notificationService';
import autoRefreshService from '../services/autoRefreshService';

const PermissionTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [dialogs, setDialogs] = useState({
    create: { open: false, template: null },
    edit: { open: false, template: null },
    delete: { open: false, template: null }
  });
  
  // Define all possible permissions
  const allPermissions = [
    'canCreateTasks',
    'canCreateMeetings',
    'canViewAllTasks',
    'canCreateLeaves',
    'canApproveLeaves',
    'canViewAllLeaves',
    'canManageUsers',
    'canManageDropdowns',
    'canViewReports',
    'canManageFiles',
    'canViewLogs'
  ];

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    permissions: {
      canCreateTasks: false,
      canCreateMeetings: false,
      canViewAllTasks: false,
      canCreateLeaves: false,
      canApproveLeaves: false,
      canViewAllLeaves: false,
      canManageUsers: false,
      canManageDropdowns: false,
      canViewReports: false,
      canManageFiles: false,
      canViewLogs: false
    }
  });

  // Fetch permission templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await permissionAPI.getAllTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error('Error fetching permission templates:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch permission templates. Please try again.';
      setError(errorMessage);
      // Set templates to empty array so UI still works
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
    
    // Subscribe to auto-refresh service
    autoRefreshService.subscribe('PermissionTemplateManagement', 'permissionTemplates', fetchTemplates, 300000);
    
    // Clean up subscription on component unmount
    return () => {
      autoRefreshService.unsubscribe('PermissionTemplateManagement');
    };
  }, [fetchTemplates]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleTemplateCreated = (data) => {
      console.log('Permission template created notification received:', data);
      setSuccess('New permission template created successfully!');
      fetchTemplates(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleTemplateUpdated = (data) => {
      console.log('Permission template updated notification received:', data);
      setSuccess('Permission template updated successfully!');
      fetchTemplates(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleTemplateDeleted = (data) => {
      console.log('Permission template deleted notification received:', data);
      setSuccess('Permission template deleted successfully!');
      fetchTemplates(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    // Subscribe to notifications
    notificationService.onPermissionTemplateCreated(handleTemplateCreated);
    notificationService.onPermissionTemplateUpdated(handleTemplateUpdated);
    notificationService.onPermissionTemplateDeleted(handleTemplateDeleted);

    // Cleanup on unmount
    return () => {
      notificationService.off('permissionTemplateCreated', handleTemplateCreated);
      notificationService.off('permissionTemplateUpdated', handleTemplateUpdated);
      notificationService.off('permissionTemplateDeleted', handleTemplateDeleted);
    };
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

  const handleCloseSnackbar = () => {
    setSuccess('');
    setError('');
  };

  const openDialog = (dialogType, template = null) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: true, template }
    }));
    
    // Pre-populate form for edit
    if (dialogType === 'edit' && template) {
      // Ensure all permissions are present in the template
      const templatePermissions = { ...formState.permissions }; // Start with default structure
      Object.keys(template.permissions || {}).forEach(key => {
        if (allPermissions.includes(key)) {
          templatePermissions[key] = template.permissions[key];
        }
      });
      
      setFormState({
        name: template.name,
        permissions: templatePermissions
      });
    } else if (dialogType === 'create') {
      // Reset form for create
      setFormState({
        name: '',
        permissions: {
          canCreateTasks: false,
          canCreateMeetings: false,
          canViewAllTasks: false,
          canCreateLeaves: false,
          canApproveLeaves: false,
          canViewAllLeaves: false,
          canManageUsers: false,
          canManageDropdowns: false,
          canViewReports: false,
          canManageFiles: false,
          canViewLogs: false
        }
      });
    }
  };

  const closeDialog = (dialogType) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: false, template: null }
    }));
  };

  const closeAllDialogs = () => {
    setDialogs({
      create: { open: false, template: null },
      edit: { open: false, template: null },
      delete: { open: false, template: null }
    });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value
    });
  };

  const handlePermissionChange = (permission) => {
    setFormState({
      ...formState,
      permissions: {
        ...formState.permissions,
        [permission]: !formState.permissions[permission]
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formState.name) {
      showSnackbar('Please enter a template name', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (dialogs.edit.template) {
        // Update existing template
        const response = await permissionAPI.updateTemplate(dialogs.edit.template.id, {
          name: formState.name,
          permissions: formState.permissions
        });
        
        showSnackbar('Permission template updated successfully!', 'success');
      } else {
        // Create new template
        const response = await permissionAPI.createTemplate({
          name: formState.name,
          permissions: formState.permissions
        });
        
        showSnackbar('Permission template created successfully!', 'success');
      }
      
      closeAllDialogs();
      fetchTemplates(); // Refresh data
    } catch (error) {
      console.error('Error saving permission template:', error);
      showSnackbar('Error saving permission template: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    try {
      setLoading(true);
      await permissionAPI.deleteTemplate(dialogs.delete.template.id);
      showSnackbar('Permission template deleted successfully!', 'success');
      closeDialog('delete');
      fetchTemplates(); // Refresh data
    } catch (error) {
      console.error('Error deleting permission template:', error);
      showSnackbar('Error deleting permission template: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter templates based on search term
  const filteredTemplates = templates.filter(template => {
    return !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.keys(template.permissions || {}).some(key => 
        template.permissions[key] && key.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
          Permission Template Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Create and manage permission templates for user roles
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{success}</Alert>
      )}

      <Grid container spacing={3}>
        {/* Permission Template List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Permission Templates
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                  }}
                />
                
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
                  Create Template
                </Button>
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
                      <TableCell>Permissions</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTemplates.map((template) => (
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
                            onClick={() => openDialog('edit', template)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openDialog('delete', template)}
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
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SaveIcon sx={{ mr: 1, color: 'primary.main' }} />
            {dialogs.edit.template ? 'Edit Permission Template' : 'Create Permission Template'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template Name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Permissions
                </Typography>
                
                <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                  {allPermissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={
                        <Checkbox
                          checked={formState.permissions[permission] || false}
                          onChange={() => handlePermissionChange(permission)}
                          color="primary"
                        />
                      }
                      label={permission.replace(/([A-Z])/g, ' $1').trim()}
                      sx={{ width: '50%', minWidth: 200, mb: 1 }}
                    />
                  ))}
                </FormGroup>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog(dialogs.create.open ? 'create' : 'edit')}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : (dialogs.edit.template ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={dialogs.delete.open} onClose={() => closeDialog('delete')}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
            Delete Permission Template
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this permission template?
          </Typography>
          {dialogs.delete.template && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {dialogs.delete.template.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('delete')}>Cancel</Button>
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
  );
};

export default PermissionTemplateManagement;