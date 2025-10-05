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
  return <ModernHelp />;
};

export default Help;
