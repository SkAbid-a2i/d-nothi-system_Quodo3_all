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
  Zoom
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
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
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
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 1,
                        '&.Mui-expanded': {
                          borderRadius: '8px 8px 0 0'
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 2 }}>
                          {category.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {category.category}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
                      {category.questions.map((faq, qIndex) => (
                        <Box key={qIndex} sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                            {faq.question}
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {faq.answer}
                          </Typography>
                          {qIndex < category.questions.length - 1 && (
                            <Divider sx={{ my: 2 }} />
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
                />
                
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SendIcon />}
                  sx={{ 
                    py: 1.5,
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #764ba2, #667eea)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
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
                      <TaskIcon />
                    </ListItemIcon>
                    <ListItemText primary="Task Management Guide" />
                    <Chip label="New" size="small" color="primary" />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <LeaveIcon />
                    </ListItemIcon>
                    <ListItemText primary="Leave Policy" />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <PeopleIcon />
                    </ListItemIcon>
                    <ListItemText primary="User Roles & Permissions" />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <ReportIcon />
                    </ListItemIcon>
                    <ListItemText primary="Reporting Guide" />
                  </ListItem>
                  
                  <ListItem button>
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="System Settings" />
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