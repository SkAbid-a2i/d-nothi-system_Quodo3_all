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
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { dropdownAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { auditLog } from '../services/auditLogger';

const DropdownManagement = () => {
  const { user } = useAuth();
  const [dropdowns, setDropdowns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [dropdownTypes] = useState(['Source', 'Category', 'Service', 'Office']);
  const [selectedDropdownType, setSelectedDropdownType] = useState('Source');
  const [dropdownValue, setDropdownValue] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [editingDropdown, setEditingDropdown] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dropdownToDelete, setDropdownToDelete] = useState(null);

  // Fetch dropdowns on component mount
  const fetchDropdowns = useCallback(async () => {
    setLoading(true);
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
      setError('Failed to fetch dropdown values');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

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

  // Filter dropdowns by selected type
  const filteredDropdowns = dropdowns.filter(d => d.type === selectedDropdownType);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dropdown Management
      </Typography>
      
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
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editingDropdown ? 'Edit Dropdown Value' : 'Add New Dropdown Value'}
            </Typography>
            
            <Box component="form" onSubmit={handleDropdownSubmit} sx={{ mt: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Dropdown Type</InputLabel>
                <Select
                  value={selectedDropdownType}
                  onChange={(e) => {
                    setSelectedDropdownType(e.target.value);
                    if (e.target.value !== 'Service') {
                      setParentCategory('');
                    }
                  }}
                  disabled={!!editingDropdown}
                >
                  {dropdownTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Value"
                value={dropdownValue}
                onChange={(e) => setDropdownValue(e.target.value)}
                sx={{ mb: 2 }}
                required
              />
              
              {selectedDropdownType === 'Service' && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Parent Category</InputLabel>
                  <Select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {editingDropdown ? 'Update' : 'Create'}
                </Button>
                
                {editingDropdown && (
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={cancelDropdownEdit}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Table Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Dropdown Values
              </Typography>
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Filter by Type</InputLabel>
                <Select
                  value={selectedDropdownType}
                  onChange={(e) => setSelectedDropdownType(e.target.value)}
                >
                  {dropdownTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    {selectedDropdownType === 'Service' && <TableCell>Parent Category</TableCell>}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDropdowns.map((dropdown) => (
                    <TableRow key={dropdown.id}>
                      <TableCell>
                        <Chip 
                          label={dropdown.type} 
                          size="small" 
                          color={
                            dropdown.type === 'Source' ? 'primary' :
                            dropdown.type === 'Category' ? 'secondary' :
                            dropdown.type === 'Service' ? 'success' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>{dropdown.value}</TableCell>
                      {selectedDropdownType === 'Service' && <TableCell>{dropdown.parentValue || 'N/A'}</TableCell>}
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditDropdown(dropdown)}
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
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this dropdown value? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteDropdown} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DropdownManagement;