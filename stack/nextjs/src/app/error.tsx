"use client";

import { useEffect } from "react";
import { Alert, Button, Box, Typography } from "@mui/material";
import { Refresh } from "@mui/icons-material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application Error:', error);
  }, [error]);

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Alert 
        severity="error" 
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={reset}
            startIcon={<Refresh />}
          >
            Try Again
          </Button>
        }
      >
        <Typography variant="h6" component="div">
          Something went wrong!
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {error.message || 'An unexpected error occurred'}
        </Typography>
      </Alert>
      
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Error Details (Development Only)
          </summary>
          <pre style={{ 
            marginTop: '0.5rem', 
            padding: '1rem', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {error.stack}
          </pre>
        </details>
      )}
    </Box>
  );
} 