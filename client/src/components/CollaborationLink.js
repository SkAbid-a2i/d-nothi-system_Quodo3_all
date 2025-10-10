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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  PriorityHigh as PriorityHighIcon
} from '@mui/icons-material';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

const CollaborationLink = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    availability: 'Always',
    urgency: 'None'
  });
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [collaborationDetailDialogOpen, setCollaborationDetailDialogOpen] = useState(false);

  // Fetch collaborations on component mount
  useEffect(() => {
    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const response = await collaborationAPI.getAllCollaborations();
      // Handle different response structures
      const collaborationsData = response.data?.data || response.data || [];
      setCollaborations(Array.isArray(collaborationsData) ? collaborationsData : []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch collaborations';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
      // Set empty array on error to prevent blank page
      setCollaborations([]);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
    if (!formData.title) {
      setError(t('collaboration.pleaseProvideTitle'));
      showSnackbar(t('collaboration.pleaseProvideTitle'), 'error');
      return;
    }

    try {
      setSaving(true);
      
      let response;
      if (selectedCollaboration) {
        // Update existing collaboration
        response = await collaborationAPI.updateCollaboration(selectedCollaboration.id, formData);
        showSnackbar(t('collaboration.updatedSuccessfully'), 'success');
      } else {
        // Create new collaboration
        response = await collaborationAPI.createCollaboration(formData);
        showSnackbar(t('collaboration.createdSuccessfully'), 'success');
      }
      
      // Handle response
      const collaborationData = response.data?.data || response.data || {};
      
      // Refresh collaborations list
      fetchCollaborations();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        availability: 'Always',
        urgency: 'None'
      });
      
      setSuccess(selectedCollaboration ? t('collaboration.updatedSuccessfully') : t('collaboration.createdSuccessfully'));
      
      // Close dialog
      setOpenDialog(false);
      setSelectedCollaboration(null);
    } catch (error) {
      console.error('Error saving collaboration:', error);
      const errorMessage = error.response?.data?.message || error.message || t('collaboration.failedToSave');
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDialog = (collaboration = null) => {
    if (collaboration) {
      setFormData({
        title: collaboration.title || '',
        description: collaboration.description || '',
        availability: collaboration.availability || 'Always',
        urgency: collaboration.urgency || 'None'
      });
      setSelectedCollaboration(collaboration);
    } else {
      setFormData({
        title: '',
        description: '',
        availability: 'Always',
        urgency: 'None'
      });
      setSelectedCollaboration(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCollaboration(null);
    // Reset form when closing dialog
    setFormData({
      title: '',
      description: '',
      availability: 'Always',
      urgency: 'None'
    });
  };

  const handleOpenCollaborationDetail = (collaboration) => {
    setSelectedCollaboration(collaboration);
    setCollaborationDetailDialogOpen(true);
  };

  const handleCloseCollaborationDetail = () => {
    setCollaborationDetailDialogOpen(false);
    setSelectedCollaboration(null);
  };

  const handleDeleteCollaboration = async (collaborationId) => {
    try {
      await collaborationAPI.deleteCollaboration(collaborationId);
      showSnackbar(t('collaboration.deletedSuccessfully'), 'success');
      // Refresh collaborations list
      fetchCollaborations();
    } catch (error) {
      console.error('Error deleting collaboration:', error);
      const errorMessage = error.response?.data?.message || error.message || t('collaboration.failedToDelete');
      showSnackbar(errorMessage, 'error');
    }
  };

  const canEditOrDelete = (collaboration) => {
    // Admin, SystemAdmin, and Supervisor can edit/delete all collaborations
    if (['Admin', 'SystemAdmin', 'Supervisor'].includes(user.role)) {
      return true;
    }
    
    // Agent can only edit/delete their own collaborations
    if (user.role === 'Agent' && collaboration.createdBy === user.id) {
      return true;
    }
    
    return false;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Immediate': return 'error';
      case 'Moderate': return 'warning';
      case 'Asap': return 'info';
      case 'Daily': return 'primary';
      default: return 'default';
    }
  };

  // Ensure we have a user before rendering
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
          {t('collaboration.title')}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
          {t('collaboration.description')}
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

      <Grid container spacing={3}>
        {/* Collaboration Form */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('collaboration.collaborationLinks')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ 
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #764ba2, #667eea)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                {t('collaboration.createLink')}
              </Button>
            </Box>
            
            {/* Collaboration List */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              {t('collaboration.activeCollaborationLinks')}
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : collaborations && collaborations.length > 0 ? (
              <Grid container spacing={2}>
                {collaborations.map((collaboration) => (
                  <Grid item xs={12} md={6} lg={4} key={collaboration.id}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        height: '100%',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        background: 'linear-gradient(135deg, #667eea10 0%, #764ba210 100%)',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                      onClick={() => handleOpenCollaborationDetail(collaboration)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {collaboration.title || t('collaboration.noTitle')}
                        </Typography>
                        <Chip 
                          label={collaboration.urgency || 'None'} 
                          size="small"
                          color={getUrgencyColor(collaboration.urgency)}
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'primary.main' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {collaboration.availability || 'Always'}
                        </Typography>
                      </Box>
                      
                      {collaboration.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary', 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {collaboration.description}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {canEditOrDelete(collaboration) && (
                          <>
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(collaboration);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCollaboration(collaboration.id);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                  {t('collaboration.noCollaborationLinks')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  {t('collaboration.createFirstLink')}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Create/Edit Collaboration Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
            {selectedCollaboration ? t('collaboration.editCollaborationLink') : t('collaboration.createCollaborationLink')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('collaboration.title')}
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('collaboration.description')}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('collaboration.availability')}</InputLabel>
                  <Select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    label={t('collaboration.availability')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  >
                    <MenuItem value="Always">{t('collaboration.always')}</MenuItem>
                    <MenuItem value="None">{t('collaboration.none')}</MenuItem>
                    <MenuItem value="Week">{t('collaboration.week')}</MenuItem>
                    <MenuItem value="Month">{t('collaboration.month')}</MenuItem>
                    <MenuItem value="Year">{t('collaboration.year')}</MenuItem>
                    <MenuItem value="Day">{t('collaboration.day')}</MenuItem>
                    <MenuItem value="Half Day">{t('collaboration.halfDay')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('collaboration.urgency')}</InputLabel>
                  <Select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    label={t('collaboration.urgency')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  >
                    <MenuItem value="Immediate">{t('collaboration.immediate')}</MenuItem>
                    <MenuItem value="Moderate">{t('collaboration.moderate')}</MenuItem>
                    <MenuItem value="Asap">{t('collaboration.asap')}</MenuItem>
                    <MenuItem value="Daily">{t('collaboration.daily')}</MenuItem>
                    <MenuItem value="None">{t('collaboration.none')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={saving}
            sx={{ 
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2, #667eea)'
              }
            }}
          >
            {saving ? t('common.saving') : (selectedCollaboration ? t('collaboration.updateLink') : t('collaboration.createLink'))}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      {/* Collaboration Detail Dialog */}
      <Dialog 
        open={collaborationDetailDialogOpen} 
        onClose={handleCloseCollaborationDetail} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              {t('collaboration.collaborationDetails')}
            </Box>
            {selectedCollaboration && (
              <Chip 
                label={selectedCollaboration.urgency || 'None'} 
                size="small"
                color={getUrgencyColor(selectedCollaboration.urgency)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCollaboration && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                    {selectedCollaboration.title || t('collaboration.noTitle')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AccessTimeIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {t('collaboration.availability')}: 
                      <Typography component="span" sx={{ fontWeight: 400, ml: 1 }}>
                        {selectedCollaboration.availability || 'Always'}
                      </Typography>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PriorityHighIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {t('collaboration.urgency')}: 
                      <Typography component="span" sx={{ fontWeight: 400, ml: 1 }}>
                        {selectedCollaboration.urgency || 'None'}
                      </Typography>
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('collaboration.description')}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {selectedCollaboration.description || t('collaboration.noDescription')}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'right', mt: 2 }}>
                    {t('collaboration.created')}: {selectedCollaboration.createdAt ? new Date(selectedCollaboration.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCollaborationDetail}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaborationLink;