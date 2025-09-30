import React from 'react';
import { SvgIcon } from '@mui/material';
import { PictureAsPdf as PdfIconMaterial } from '@mui/icons-material';

const PdfIcon = (props) => {
  return (
    <SvgIcon {...props}>
      <PdfIconMaterial />
    </SvgIcon>
  );
};

export default PdfIcon;