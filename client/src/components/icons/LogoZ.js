import React from 'react';

const LogoZ = ({ size = 40, style = {} }) => {
  return (
    <img 
      src="/D-nothi logo-01.png" 
      alt="Zenith Logo" 
      style={{ 
        width: size, 
        height: size, 
        ...style 
      }} 
    />
  );
};

export default LogoZ;