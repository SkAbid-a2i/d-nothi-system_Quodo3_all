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
  AccessTime as AccessTimeIcon,
  PriorityHigh as PriorityHighIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { collaborationAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';

const CollaborationLink = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [collaborationDetailDialogOpen, setCollaborationDetailDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    availability: 'Always',
    urgency: 'None'
  });

  // Fetch collaborations on component mount
  useEffect(() => {
    if (user) {
      fetchCollaborations();
    }
  }, [user]);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      const response = await collaborationAPI.getAllCollaborations();
      const collaborationsData = response.data?.data || response.data || [];
      setCollaborations(Array.isArray(collaborationsData) ? collaborationsData : []);
    } catch (err) {
      console.error('Error fetching collaborations:', err);
      setError(t('collaboration.errorFetching'));
      showSnackbar(t('collaboration.errorFetching'), 'error');
      setCollaborations([]); // Set empty array on error
    } finally {
      setLoading(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title) {
      setError(t('collaboration.titleRequired'));
      showSnackbar(t('collaboration.titleRequired'), 'error');
      return;
    }

    setSaving(true);
    try {
      const collaborationData = {
        title: formData.title,
        description: formData.description,
        availability: formData.availability,
        urgency: formData.urgency
      };

      let response;
      if (selectedCollaboration) {
        // Update existing collaboration
        response = await collaborationAPI.updateCollaboration(selectedCollaboration.id, collaborationData);
        showSnackbar(t('collaboration.collaborationUpdated'), 'success');
      } else {
        // Create new collaboration
        response = await collaborationAPI.createCollaboration(collaborationData);
        showSnackbar(t('collaboration.collaborationCreated'), 'success');
      }

      // Update local state
      const updatedCollaboration = response.data?.data || response.data;
      if (selectedCollaboration) {
        // Update existing collaboration in list
        setCollaborations(prev => 
          prev.map(item => 
            item.id === selectedCollaboration.id ? updatedCollaboration : item
          )
        );
      } else {
        // Add new collaboration to list
        setCollaborations(prev => [updatedCollaboration, ...prev]);
      }

      handleCloseDialog();
    } catch (err) {
      console.error('Error saving collaboration:', err);
      const errorMessage = err.response?.data?.message || t('collaboration.errorSaving');
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await collaborationAPI.deleteCollaboration(id);
      setCollaborations(prev => prev.filter(item => item.id !== id));
      showSnackbar(t('collaboration.collaborationDeleted'), 'success');
    } catch (err) {
      console.error('Error deleting collaboration:', err);
      const errorMessage = err.response?.data?.message || t('collaboration.errorDeleting');
      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Immediate': return 'error';
      case 'Moderate': return 'warning';
      case 'Asap': return 'info';
      case 'Daily': return 'success';
      default: return 'default';
    }
  };

  // Check if current user can edit or delete a collaboration
  const canEditOrDelete = (collaboration) => {
    return user && (user.id === collaboration.createdBy || user.role === 'SystemAdmin');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {t('collaboration.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('collaboration.description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2, #667eea)'
            }
          }}
        >
          {t('collaboration.createLink')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {collaborations.map((collaboration) => (
            <Grid item xs={12} md={6} lg={4} key={collaboration.id}>
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  },
                  transition: 'all 0.3s ease-in-out'
                }}
                onClick={() => handleOpenCollaborationDetail(collaboration)}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      flex: 1,
                      wordBreak: 'break-word'
                    }}
                  >
                    {collaboration.title || t('collaboration.noTitle')}
                  </Typography>
                  <Chip
                    label={collaboration.urgency || 'None'}
                    size="small"
                    color={getUrgencyColor(collaboration.urgency)}
                    sx={{ ml: 1 }}
                  />
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    flex: 1,
                    wordBreak: 'break-word'
                  }}
                >
                  {collaboration.description || t('collaboration.noDescription')}
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 'auto'
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t('collaboration.availability')}: {collaboration.availability || 'Always'}
                    </Typography>
                  </Box>
                  <Box>
                    {canEditOrDelete(collaboration) && (
                      <>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(collaboration);
                          }}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(collaboration.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle>
          {selectedCollaboration 
            ? t('collaboration.editLink') 
            : t('collaboration.createLink')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('collaboration.titleLabel')}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
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
                  multiline
                  rows={4}
                  label={t('collaboration.descriptionLabel')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
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
                    onChange={handleChange}
                    label={t('collaboration.availability')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  >
                    <MenuItem value="Always">{t('collaboration.always')}</MenuItem>
                    <MenuItem value="Weekdays">{t('collaboration.weekdays')}</MenuItem>
                    <MenuItem value="Weekends">{t('collaboration.weekends')}</MenuItem>
                    <MenuItem value="BusinessHours">{t('collaboration.businessHours')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('collaboration.urgency')}</InputLabel>
                  <Select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
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
          <Button onClick={handleCloseDialog}>
            {t('common.cancel')}
          </Button>
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
            {saving ? t('common.saving') : (
              selectedCollaboration ? 
                t('collaboration.updateLink') : 
                t('collaboration.createLink')
            )}
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
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: '80vh',
            overflowY: 'auto'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
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
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 2,
                      wordBreak: 'break-word'
                    }}
                  >
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

                {/* Creator Information */}
                {selectedCollaboration.creator && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <PersonIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {t('collaboration.createdBy')}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5 }}>
                          {selectedCollaboration.creator.fullName || selectedCollaboration.creator.username}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('collaboration.description')}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word'
                    }}
                  >
                    {selectedCollaboration.description || t('collaboration.noDescription')}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary', 
                      textAlign: 'right', 
                      mt: 2 
                    }}
                  >
                    {t('collaboration.created')}: 
                    {selectedCollaboration.createdAt ? 
                      new Date(selectedCollaboration.createdAt).toLocaleString() : 
                      'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCollaborationDetail}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaborationLink;