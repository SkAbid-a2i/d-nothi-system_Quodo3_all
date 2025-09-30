import React from 'react';
import { SvgIcon } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';

const CsvIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <DescriptionIcon />
    </SvgIcon>
  );
};

export default CsvIcon;