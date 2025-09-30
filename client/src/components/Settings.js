import React, { useState } from 'react';
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
  Tab
} from '@mui/material';
import { useTranslation } from '../contexts/TranslationContext';

const Settings = () => {
  const { t, changeLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
                      <MenuItem value="Agent">Agent</MenuItem>
                      <MenuItem value="Supervisor">Supervisor</MenuItem>
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="SystemAdmin">System Administrator</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained">
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
                  <Button variant="contained">
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
                      defaultValue="en"
                      onChange={(e) => changeLanguage(e.target.value)}
                    >
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('settings.theme')}</InputLabel>
                    <Select defaultValue="light">
                      <MenuItem value="light">Light</MenuItem>
                      <MenuItem value="dark">Dark</MenuItem>
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
                  <Button variant="contained">
                    {t('common.save')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;