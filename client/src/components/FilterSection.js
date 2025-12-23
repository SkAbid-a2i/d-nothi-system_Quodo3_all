import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, FilterList as FilterIcon } from '@mui/icons-material';

const FilterSection = ({
  title = 'Filters',
  children,
  defaultExpanded = false,
  onApplyFilters,
  onClearFilters,
  hasActiveFilters = false,
  sx = {}
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleExpandChange = (isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <Paper 
      sx={{ 
        p: 2, 
        mb: 3,
        boxShadow: 3,
        borderRadius: 2,
        ...sx
      }}
    >
      <Accordion 
        expanded={expanded} 
        onChange={(event, isExpanded) => handleExpandChange(isExpanded)}
        sx={{ 
          boxShadow: 'none',
          '&:before': {
            display: 'none'
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            flexDirection: 'row-reverse',
            '& .MuiAccordionSummary-expandIconWrapper': {
              transform: expanded ? 'rotate(180deg)' : 'none',
            },
            '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
              transform: 'rotate(180deg)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <FilterIcon 
              sx={{ 
                mr: 1, 
                color: hasActiveFilters ? 'primary.main' : 'inherit' 
              }} 
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: hasActiveFilters ? 'primary.main' : 'inherit'
              }}
            >
              {title}
            </Typography>
            {hasActiveFilters && (
              <Box
                sx={{
                  ml: 1,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} alignItems="center">
            {children}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
              {onClearFilters && (
                <Button 
                  variant="outlined" 
                  onClick={onClearFilters}
                  size="small"
                >
                  Clear Filters
                </Button>
              )}
              {onApplyFilters && (
                <Button 
                  variant="contained" 
                  onClick={onApplyFilters}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  Apply Filters
                </Button>
              )}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default FilterSection;