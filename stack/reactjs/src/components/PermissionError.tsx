import React from 'react';
import { Typography } from '@mui/material';

interface PermissionErrorProps {
  error: string;
}

const PermissionError: React.FC<PermissionErrorProps> = ({ error }) => {
  return (
    <Typography variant="subtitle1" color="error" style={{textAlign: 'center', marginTop:20, marginBottom:20}}>
      {error}
    </Typography>
  );
};

export default PermissionError;
