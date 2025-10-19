import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Chip,
  Fade,
  Zoom,
  Grid,
  useTheme
} from '@mui/material';
import { 
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Task as TaskIcon,
  EventAvailable as LeaveIcon,
  People as PeopleIcon,
  BarChart as ReportIcon,
  Settings as SettingsIcon,
  ContactSupport as ContactIcon,
  Send as SendIcon
} from '@mui/icons-material';

const ModernHelp = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState(false);

  const faqs = [
    {
      category: 'Tasks',
      icon: <TaskIcon />,
      questions: [
        {
          question: 'How do I create a new task?',
          answer: 'To create a new task, navigate to the Task Logger page and fill out the form with the required details including date, source, category, and description. Click "Create Task" to submit.'
        },
        {
          question: 'Can I edit or delete a task?',
          answer: 'Yes, you can edit or delete tasks from the task list. Click the edit icon to modify task details or the delete icon to remove a task.'
        }
      ]
    },
    {
      category: 'Leaves',
      icon: <LeaveIcon />,
      questions: [
        {
          question: 'How do I request leave?',
          answer: 'Go to the Leave Management page and fill out the leave request form with start date, end date, and reason. Submit the request and wait for approval from your supervisor.'
        },
        {
          question: 'How do I approve leave requests?',
          answer: 'As an admin or supervisor, you can approve or reject leave requests from the Leave Management page. Look for pending requests and use the approve or reject buttons.'
        }
      ]
    },
    {
      category: 'Users',
      icon: <PeopleIcon />,
      questions: [
        {
          question: 'How do I add a new user?',
          answer: 'Only administrators can add new users. Go to the User Management page and use the "Create New User" form to add users with appropriate roles and permissions.'
        },
        {
          question: 'What are the different user roles?',
          answer: 'There are several user roles: Agent (basic user), Supervisor (can manage tasks and leaves), Admin (full access except system settings), and System Admin (full access to all features).'
        }
      ]
    }
  ];

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #967bb6, #98fb98)' 
                : 'linear-gradient(45deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Help & Support
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Find answers to common questions and get support
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Zoom in={true} timeout={800}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HelpIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Frequently Asked Questions
                  </Typography>
                </Box>
                
                <TextField
                  fullWidth
                  placeholder="Search help topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 3 }}
                />
                
                {faqs.map((category, index) => (
                  <Accordion 
                    key={category.category}
                    expanded={expanded === `panel${index}`}
                    onChange={handleAccordionChange(`panel${index}`)}
                    sx={{ mb: 2 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        bgcolor: theme.palette.mode === 'dark' ? '#1e293b' : 'primary.main',
                        color: theme.palette.mode === 'dark' ? 'white' : 'white',
                        borderRadius: 1,
                        '&.Mui-expanded': {
                          borderRadius: '8px 8px 0 0'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 2, color: theme.palette.mode === 'dark' ? 'primary.main' : 'inherit' }}>
                          {category.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.category}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ 
                      bgcolor: theme.palette.mode === 'dark' ? '#0f172a' : 'grey.50',
                      color: theme.palette.mode === 'dark' ? '#cbd5e1' : 'inherit'
                    }}>
                      {category.questions.map((faq, qIndex) => (
                        <Box key={qIndex} sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            mb: 1, 
                            color: theme.palette.mode === 'dark' ? '#667eea' : 'primary.main' 
                          }}>
                            {faq.question}
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: theme.palette.mode === 'dark' ? '#cbd5e1' : 'text.secondary' 
                          }}>
                            {faq.answer}
                          </Typography>
                          {qIndex < category.questions.length - 1 && (
                            <Divider sx={{ 
                              my: 2,
                              borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
                            }} />
                          )}
                        </Box>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Paper>
            </Zoom>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Zoom in={true} timeout={1000}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ContactIcon sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Contact Support
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Can't find what you're looking for? Reach out to our support team.
                </Typography>
                
                <TextField
                  fullWidth
                  label="Subject"
                  sx={{ mb: 2 }}
                  InputProps={{
                    style: {
                      color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                    }
                  }}
                  InputLabelProps={{
                    style: {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                  InputProps={{
                    style: {
                      color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                    }
                  }}
                  InputLabelProps={{
                    style: {
                      color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
                    }
                  }}
                />
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SendIcon />}
                  sx={{ 
                    py: 1.5,
                    background: theme.palette.mode === 'dark' 
                      ? 'linear-gradient(45deg, #967bb6, #98fb98)' 
                      : 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: theme.palette.mode === 'dark' ? '#0f172a' : 'white',
                    '&:hover': {
                      background: theme.palette.mode === 'dark' 
                        ? 'linear-gradient(45deg, #98fb98, #967bb6)' 
                        : 'linear-gradient(45deg, #764ba2, #667eea)',
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 4px 15px rgba(150, 123, 182, 0.4)' 
                        : '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                >
                  Send Message
                </Button>
              </Paper>
              
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Quick Links
                </Typography>
                
                <List>
                  <ListItem button>
                    <ListItemIcon>
                      <TaskIcon sx={{ color: theme.palette.mode === 'dark' ? '#667eea' : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Task Management Guide" 
                      primaryTypographyProps={{
                        style: {
                          color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }
                      }}
                    />
                    <Chip label="New" size="small" color="primary" />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <LeaveIcon sx={{ color: theme.palette.mode === 'dark' ? '#967bb6' : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Leave Policy" 
                      primaryTypographyProps={{
                        style: {
                          color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }
                      }}
                    />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <PeopleIcon sx={{ color: theme.palette.mode === 'dark' ? '#f093fb' : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="User Roles & Permissions" 
                      primaryTypographyProps={{
                        style: {
                          color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }
                      }}
                    />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <ReportIcon sx={{ color: theme.palette.mode === 'dark' ? '#3b82f6' : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Reporting Guide" 
                      primaryTypographyProps={{
                        style: {
                          color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }
                      }}
                    />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <SettingsIcon sx={{ color: theme.palette.mode === 'dark' ? '#10b981' : 'inherit' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary="System Settings" 
                      primaryTypographyProps={{
                        style: {
                          color: theme.palette.mode === 'dark' ? '#f1f5f9' : '#1e293b'
                        }
                      }}
                    />
                  </ListItem>
                </List>
              </Paper>
            </Zoom>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default ModernHelp;