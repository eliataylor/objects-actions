import Link from "next/link";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Home, ArrowBack } from "@mui/icons-material";

export default function NotFound() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        p: 4 
      }}
    >
      <Paper 
        elevation={2} 
        sx={{ 
          p: 6, 
          textAlign: 'center', 
          maxWidth: 500,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography 
          variant="h1" 
          component="h1" 
          sx={{ 
            fontSize: '6rem', 
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component={Link}
            href="/"
            startIcon={<Home />}
          >
            Go Home
          </Button>          
        </Box>
      </Paper>
    </Box>
  );
} 