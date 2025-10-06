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
  Switch,
  FormControlLabel,
  Autocomplete
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Source as SourceIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { dropdownAPI } from '../services/api';
import notificationService from '../services/notificationService';

const DropdownManagement = () => {
  const [dropdowns, setDropdowns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Dialog states
  const [dialogs, setDialogs] = useState({
    create: { open: false, dropdown: null },
    edit: { open: false, dropdown: null },
    delete: { open: false, dropdown: null }
  });
  
  // Form state
  const [formState, setFormState] = useState({
    type: 'Category',
    value: '',
    parentType: '',
    parentValue: '',
    isActive: true
  });
  
  // Available dropdown types
  const dropdownTypes = [
    { value: 'Category', label: 'Category', icon: <CategoryIcon /> },
    { value: 'Service', label: 'Service', icon: <BuildIcon /> },
    { value: 'Source', label: 'Source', icon: <SourceIcon /> },
    { value: 'Office', label: 'Office', icon: <BusinessIcon /> }
  ];

  // Fetch dropdown values
  const fetchDropdowns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await dropdownAPI.getAllDropdowns();
      setDropdowns(response.data || []);
    } catch (error) {
      console.error('Error fetching dropdown values:', error);
      setError('Error fetching dropdown values: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dropdowns on component mount
  useEffect(() => {
    fetchDropdowns();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    const handleDropdownCreated = (data) => {
      console.log('Dropdown created notification received:', data);
      setSuccess('New dropdown value created successfully!');
      fetchDropdowns(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleDropdownUpdated = (data) => {
      console.log('Dropdown updated notification received:', data);
      setSuccess('Dropdown value updated successfully!');
      fetchDropdowns(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleDropdownDeleted = (data) => {
      console.log('Dropdown deleted notification received:', data);
      setSuccess('Dropdown value deleted successfully!');
      fetchDropdowns(); // Refresh data
      setTimeout(() => setSuccess(''), 3000);
    };

    // Subscribe to notifications
    notificationService.onDropdownCreated(handleDropdownCreated);
    notificationService.onDropdownUpdated(handleDropdownUpdated);
    notificationService.onDropdownDeleted(handleDropdownDeleted);

    // Cleanup on unmount
    return () => {
      notificationService.off('dropdownCreated', handleDropdownCreated);
      notificationService.off('dropdownUpdated', handleDropdownUpdated);
      notificationService.off('dropdownDeleted', handleDropdownDeleted);
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

  const openDialog = (dialogType, dropdown = null) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: true, dropdown }
    }));
    
    // Pre-populate form for edit
    if (dialogType === 'edit' && dropdown) {
      setFormState({
        type: dropdown.type,
        value: dropdown.value,
        parentType: dropdown.parentType || '',
        parentValue: dropdown.parentValue || '',
        isActive: dropdown.isActive !== undefined ? dropdown.isActive : true
      });
    } else if (dialogType === 'create') {
      // Reset form for create
      setFormState({
        type: 'Category',
        value: '',
        parentType: '',
        parentValue: '',
        isActive: true
      });
    }
  };

  const closeDialog = (dialogType) => {
    setDialogs(prev => ({
      ...prev,
      [dialogType]: { open: false, dropdown: null }
    }));
  };

  const closeAllDialogs = () => {
    setDialogs({
      create: { open: false, dropdown: null },
      edit: { open: false, dropdown: null },
      delete: { open: false, dropdown: null }
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

  const handleSwitchChange = (e) => {
    setFormState({
      ...formState,
      isActive: e.target.checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formState.value) {
      showSnackbar('Please enter a value', 'error');
      return;
    }
    
    if (formState.type === 'Service' && !formState.parentValue) {
      showSnackbar('Please select a parent category for service', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (dialogs.edit.dropdown) {
        // Update existing dropdown
        const response = await dropdownAPI.updateDropdownValue(dialogs.edit.dropdown.id, {
          type: formState.type,
          value: formState.value,
          parentType: formState.type === 'Service' ? formState.parentType : undefined,
          parentValue: formState.type === 'Service' ? formState.parentValue : undefined,
          isActive: formState.isActive
        });
        
        showSnackbar('Dropdown value updated successfully!', 'success');
      } else {
        // Create new dropdown
        const response = await dropdownAPI.createDropdownValue({
          type: formState.type,
          value: formState.value,
          parentType: formState.type === 'Service' ? formState.parentType : undefined,
          parentValue: formState.type === 'Service' ? formState.parentValue : undefined
        });
        
        showSnackbar('Dropdown value created successfully!', 'success');
      }
      
      closeAllDialogs();
      fetchDropdowns(); // Refresh data
    } catch (error) {
      console.error('Error saving dropdown value:', error);
      showSnackbar('Error saving dropdown value: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDropdown = async () => {
    try {
      setLoading(true);
      await dropdownAPI.deleteDropdownValue(dialogs.delete.dropdown.id);
      showSnackbar('Dropdown value deleted successfully!', 'success');
      closeDialog('delete');
      fetchDropdowns(); // Refresh data
    } catch (error) {
      console.error('Error deleting dropdown value:', error);
      showSnackbar('Error deleting dropdown value: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories for service parent selection
  const categories = [...new Set(dropdowns
    .filter(d => d.type === 'Category' && d.isActive)
    .map(d => d.value))];

  // Filter dropdowns based on search term and type filter
  const filteredDropdowns = dropdowns.filter(dropdown => {
    const matchesSearch = !searchTerm || 
      dropdown.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || dropdown.type === typeFilter;
    
    return matchesSearch && matchesType;
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
          Dropdown Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          Manage dropdown values for categories, services, sources, and offices
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{error}</Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={handleCloseSnackbar}>{success}</Alert>
      )}

      <Grid container spacing={3}>
        {/* Dropdown List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Dropdown Values
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search values..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, fontSize: 20 }} />
                  }}
                />
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
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
                  Add Value
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
                            onClick={() => openDialog('edit', dropdown)}
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => openDialog('delete', dropdown)}
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
            <SaveIcon sx={{ mr: 1, color: 'primary.main' }} />
            {dialogs.edit.dropdown ? 'Edit Dropdown Value' : 'Create Dropdown Value'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formState.type}
                    onChange={handleInputChange}
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
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Value"
                  name="value"
                  value={formState.value}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              
              {formState.type === 'Service' && (
                <>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={categories}
                      value={formState.parentValue}
                      onChange={(event, newValue) => {
                        setFormState({
                          ...formState,
                          parentValue: newValue || '',
                          parentType: 'Category'
                        });
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Parent Category" 
                          required 
                        />
                      )}
                    />
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formState.isActive}
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
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving...' : (dialogs.edit.dropdown ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={dialogs.delete.open} onClose={() => closeDialog('delete')}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
            Delete Dropdown Value
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this dropdown value?
          </Typography>
          {dialogs.delete.dropdown && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {dialogs.delete.dropdown.type}: {dialogs.delete.dropdown.value}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog('delete')}>Cancel</Button>
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

export default DropdownManagement;