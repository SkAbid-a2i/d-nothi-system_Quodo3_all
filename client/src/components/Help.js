import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useTranslation } from '../contexts/TranslationContext';

const Help = () => {
  const { t, changeLanguage } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [language, setLanguage] = useState('en');

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Mock help content
  const faqItems = [
    {
      question: t('help.faqItems.createTask.question'),
      answer: t('help.faqItems.createTask.answer')
    },
    {
      question: t('help.faqItems.submitLeave.question'),
      answer: t('help.faqItems.submitLeave.answer')
    },
    {
      question: t('help.faqItems.exportReports.question'),
      answer: t('help.faqItems.exportReports.answer')
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('help.title')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LanguageIcon sx={{ mr: 1 }} />
          <FormControl size="small">
            <Select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                changeLanguage(e.target.value);
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="bn">বাংলা (Bengali)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={t('help.videoTutorial')} />
          <Tab label={t('help.userGuide')} />
          <Tab label={t('help.faq')} />
        </Tabs>
        
        {activeTab === 0 && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              {t('help.videoTutorial')}
            </Typography>
            <Box 
              sx={{ 
                height: 400, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.200',
                borderRadius: 1,
                mb: 2
              }}
            >
              <iframe 
                width="100%" 
                height="315" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="D-Nothi Task Management Tutorial" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('help.videoTutorial')}
            </Typography>
          </Box>
        )}
        
        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('help.userGuide')}
            </Typography>
            <Box 
              sx={{ 
                height: 400, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.200',
                borderRadius: 1,
                mb: 2
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="h6" gutterBottom>
                  Getting Started with D-Nothi Task Management
                </Typography>
                <Typography paragraph>
                  Welcome to the D-Nothi Task Management system. This guide will help you understand how to use all the features of our comprehensive task, leave, and user management platform.
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Creating Tasks
                </Typography>
                <Typography paragraph>
                  To create a new task, navigate to the Task Logger page and fill out the form with the required information. You can select from dynamic dropdowns for Source, Category, and Service. The Service dropdown is dependent on the Category selection.
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Managing Leaves
                </Typography>
                <Typography paragraph>
                  Submit leave requests through the Leaves section. Admins and supervisors can approve or reject requests in the same interface.
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('help.userGuide')}
            </Typography>
          </Box>
        )}
        
        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('help.faq')}
            </Typography>
            {faqItems.map((item, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t('help.needHelp')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('help.contactSupport')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Help;