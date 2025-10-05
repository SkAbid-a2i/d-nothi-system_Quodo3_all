import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from '@mui/material';
import { useTranslation } from '../contexts/TranslationContext';

const Settings = ({ darkMode, setDarkMode }) => {
  const { t, changeLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLanguageChange = (language) => {
    setCurrentLanguage(language);
    changeLanguage(language);
    showSnackbar(t('settings.settingsSaved'), 'success');
  };

  const handleThemeChange = (theme) => {
    const isDark = theme === 'dark';
    setDarkMode(isDark);
    localStorage.setItem('theme', theme);
    showSnackbar(t('settings.settingsSaved'), 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        {t('settings.title')}
      </Typography>
      
      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('settings.profile')} />
          <Tab label={t('settings.security')} />
          <Tab label={t('settings.application')} />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('settings.profile')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('users.fullName')}
                    defaultValue="System Administrator"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('users.email')}
                    defaultValue="admin@example.com"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('users.username')}
                    defaultValue="admin"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('users.role')}</InputLabel>
                    <Select defaultValue="SystemAdmin">
                      <MenuItem value="Agent">{t('users.role.agent')}</MenuItem>
                      <MenuItem value="Supervisor">{t('users.role.supervisor')}</MenuItem>
                      <MenuItem value="Admin">{t('users.role.admin')}</MenuItem>
                      <MenuItem value="SystemAdmin">{t('users.role.systemAdmin')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={() => showSnackbar(t('settings.settingsSaved'), 'success')}>
                    {t('common.save')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('settings.security')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('settings.currentPassword')}
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}></Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('settings.newPassword')}
                    type="password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('settings.confirmNewPassword')}
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={() => showSnackbar(t('settings.settingsSaved'), 'success')}>
                    {t('settings.changePassword')}
                  </Button>
                </Grid>
              </Grid>
              
              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch />}
                    label={t('settings.enable2FA')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined">
                    {t('settings.configure2FA')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {t('settings.application')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.language')}</InputLabel>
                    <Select 
                      value={currentLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.theme')}</InputLabel>
                    <Select 
                      value={darkMode ? 'dark' : 'light'}
                      onChange={(e) => handleThemeChange(e.target.value)}
                    >
                      <MenuItem value="light">{t('settings.theme.light')}</MenuItem>
                      <MenuItem value="dark">{t('settings.theme.dark')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label={t('settings.notifications')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={<Switch />}
                    label={t('settings.autoRefresh')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" onClick={() => showSnackbar(t('settings.settingsSaved'), 'success')}>
                    {t('common.save')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
      
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
    </Box>
  );
};

export default Settings;