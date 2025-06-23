import { Alert, AlertTitle, Box } from "@mui/material";
import { Lock } from "@mui/icons-material";

interface PermissionErrorProps {
  error: string;
  title?: string;
}

export default function PermissionError({ 
  error, 
  title = "Access Denied" 
}: PermissionErrorProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Alert severity="error" icon={<Lock />}>
        <AlertTitle>{title}</AlertTitle>
        {error}
      </Alert>
    </Box>
  );
} 