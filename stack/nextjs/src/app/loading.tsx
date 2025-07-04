import { CircularProgress, Box } from "@mui/material";

export default function Loading() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <CircularProgress size={40} />
      <span style={{ color: '#666' }}>Loading...</span>
    </Box>
  );
} 