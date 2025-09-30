import React from 'react';
import { SvgIcon } from '@mui/material';
import { GridOn as GridOnIcon } from '@mui/icons-material';

const ExcelIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <GridOnIcon />
    </SvgIcon>
  );
};

export default ExcelIcon;