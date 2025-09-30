import React from 'react';
import { Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

// Test component to verify JSX syntax
const TestComponent = () => {
  return (
    <div>
      <Button variant="contained" startIcon={<AddIcon />}>
        Test Button
      </Button>
    </div>
  );
};

export default TestComponent;