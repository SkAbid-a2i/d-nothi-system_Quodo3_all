import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper,
  Fade
} from '@mui/material';
import RealUserManagement from './RealUserManagement';
import PermissionTemplateManagement from './PermissionTemplateManagement';
import DropdownManagement from './DropdownManagement';

const AdminConsole = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
            <Tab label="User Management" />
            <Tab label="Permission Templates" />
            <Tab label="Dropdown Management" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && <RealUserManagement />}
            {activeTab === 1 && <PermissionTemplateManagement />}
            {activeTab === 2 && <DropdownManagement />}
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};

export default AdminConsole;