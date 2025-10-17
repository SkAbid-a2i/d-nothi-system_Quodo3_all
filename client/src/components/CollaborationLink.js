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
  Snackbar
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
import notificationService from '../services/notificationService';

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

  // Listen for collaboration notifications
  useEffect(() => {
    const handleCollaborationCreated = () => {
      fetchCollaborations();
    };

    const handleCollaborationUpdated = () => {
      fetchCollaborations();
    };

    const handleCollaborationDeleted = () => {
      fetchCollaborations();
    };

    // Subscribe to collaboration notifications
    notificationService.onCollaborationCreated(handleCollaborationCreated);
    notificationService.onCollaborationUpdated(handleCollaborationUpdated);
    notificationService.onCollaborationDeleted(handleCollaborationDeleted);

    // Cleanup on unmount
    return () => {
      notificationService.off('collaborationCreated', handleCollaborationCreated);
      notificationService.off('collaborationUpdated', handleCollaborationUpdated);
      notificationService.off('collaborationDeleted', handleCollaborationDeleted);
    };
  }, []);

  const fetchCollaborations = async () => {
    setLoading(true);
    try {
      console.log('Fetching collaborations for user:', user);
      const response = await collaborationAPI.getAllCollaborations();
      console.log('Collaborations response:', response);
      const collaborationsData = response.data?.data || response.data || [];
      setCollaborations(Array.isArray(collaborationsData) ? collaborationsData : []);
    } catch (err) {
      console.error('Error fetching collaborations:', err);
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || t('collaboration.errorFetching') || 'Failed to fetch collaborations';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!formData.title) {
      const errorMessage = t('collaboration.titleRequired') || 'Title is required';
      setError(errorMessage);
      showSnackbar(errorMessage, 'error');
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

      console.log('Submitting collaboration data:', collaborationData);
      let response;
      if (selectedCollaboration) {
        // Update existing collaboration
        console.log('Updating collaboration:', selectedCollaboration.id);
        response = await collaborationAPI.updateCollaboration(selectedCollaboration.id, collaborationData);
        showSnackbar(t('collaboration.collaborationUpdated') || 'Collaboration link updated successfully!', 'success');
      } else {
        // Create new collaboration
        console.log('Creating new collaboration');
        response = await collaborationAPI.createCollaboration(collaborationData);
        showSnackbar(t('collaboration.collaborationCreated') || 'Collaboration link created successfully!', 'success');
      }

      console.log('Collaboration response:', response);
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
      console.error('Error response:', err.response);
      const errorMessage = err.response?.data?.message || err.message || t('collaboration.errorSaving') || 'Error saving collaboration link. Please try again.';
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
      showSnackbar(t('collaboration.collaborationDeleted') || 'Collaboration link deleted successfully!', 'success');
    } catch (err) {
      console.error('Error deleting collaboration:', err);
      const errorMessage = err.response?.data?.message || err.message || t('collaboration.errorDeleting') || 'Error deleting collaboration link. Please try again.';
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
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%)', minHeight: '100vh' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2,
        background: 'white',
        borderRadius: 3,
        p: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t('collaboration.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            {t('collaboration.description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            borderRadius: '50px',
            padding: '12px 24px',
            fontWeight: 600,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
            }
          }}
        >
          {t('collaboration.createLink')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} thickness={4} sx={{ color: '#667eea' }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {collaborations.map((collaboration) => (
            <Grid item xs={12} md={6} lg={4} key={collaboration.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  borderRadius: 3,
                  background: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(102, 126, 234, 0.3)'
                  }
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
                      fontWeight: 700, 
                      flex: 1,
                      wordBreak: 'break-word',
                      color: '#333'
                    }}
                  >
                    {collaboration.title || t('collaboration.noTitle')}
                  </Typography>
                  <Chip
                    label={collaboration.urgency || 'None'}
                    size="small"
                    color={getUrgencyColor(collaboration.urgency)}
                    sx={{ 
                      ml: 1,
                      fontWeight: 600,
                      borderRadius: '20px',
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </Box>

                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3, 
                    flex: 1,
                    wordBreak: 'break-word',
                    lineHeight: 1.6
                  }}
                >
                  {collaboration.description || t('collaboration.noDescription')}
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 'auto',
                  pt: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)'
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
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
                          sx={{ 
                            mr: 1,
                            background: 'rgba(102, 126, 234, 0.1)',
                            '&:hover': {
                              background: 'rgba(102, 126, 234, 0.2)'
                            }
                          }}
                        >
                          <EditIcon sx={{ color: '#667eea' }} />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(collaboration.id);
                          }}
                          sx={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            '&:hover': {
                              background: 'rgba(239, 68, 68, 0.2)'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ color: '#ef4444' }} />
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
            borderRadius: 3,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)', 
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}>
          {selectedCollaboration 
            ? t('collaboration.editLink') 
            : t('collaboration.createLink')}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('collaboration.titleLabel')}
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label={t('collaboration.descriptionLabel')}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      '& fieldset': {
                        borderWidth: '2px'
                      },
                      '&:hover fieldset': {
                        borderColor: '#667eea'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#667eea'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ fontWeight: 500 }}>{t('collaboration.availability')}</InputLabel>
                  <Select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    label={t('collaboration.availability')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea'
                        }
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
                <FormControl fullWidth variant="outlined">
                  <InputLabel sx={{ fontWeight: 500 }}>{t('collaboration.urgency')}</InputLabel>
                  <Select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    label={t('collaboration.urgency')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        '& fieldset': {
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: '#667eea'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#667eea'
                        }
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
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{
              borderRadius: '50px',
              padding: '8px 20px',
              fontWeight: 600
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={saving ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SaveIcon />}
            disabled={saving}
            sx={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '50px',
              padding: '8px 24px',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #764ba2, #667eea)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)'
              },
              '&.Mui-disabled': {
                background: 'rgba(0, 0, 0, 0.12)'
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
          sx={{ 
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
          }}
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
            borderRadius: 3,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)', 
          color: 'white',
          fontWeight: 600,
          fontSize: '1.5rem'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1 }} />
              {t('collaboration.collaborationDetails')}
            </Box>
            {selectedCollaboration && (
              <Chip
                label={selectedCollaboration.urgency || 'None'}
                size="small"
                color={getUrgencyColor(selectedCollaboration.urgency)}
                sx={{ 
                  fontWeight: 600,
                  borderRadius: '20px',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedCollaboration && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 3,
                      wordBreak: 'break-word',
                      color: '#333'
                    }}
                  >
                    {selectedCollaboration.title || t('collaboration.noTitle')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AccessTimeIcon sx={{ fontSize: 24, mr: 2, color: '#667eea' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {t('collaboration.availability')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                        {selectedCollaboration.availability || 'Always'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PriorityHighIcon sx={{ fontSize: 24, mr: 2, color: '#667eea' }} />
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {t('collaboration.urgency')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                        {selectedCollaboration.urgency || 'None'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Creator Information */}
                {selectedCollaboration.creator && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <PersonIcon sx={{ fontSize: 24, mr: 2, color: '#667eea', mt: 0.5 }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {t('collaboration.createdBy')}:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 400, mt: 0.5, fontSize: '1rem' }}>
                          {selectedCollaboration.creator.fullName || selectedCollaboration.creator.username}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                    {t('collaboration.description')}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      wordBreak: 'break-word',
                      lineHeight: 1.8,
                      fontSize: '1.1rem',
                      color: '#555'
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
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid rgba(0, 0, 0, 0.1)'
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
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseCollaborationDetail}
            sx={{
              borderRadius: '50px',
              padding: '8px 24px',
              fontWeight: 600
            }}
          >
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollaborationLink;