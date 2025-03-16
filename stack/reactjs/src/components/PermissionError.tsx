import React from "react";
import { Typography } from "@mui/material";

interface PermissionErrorProps {
  error: string;
}

const PermissionError: React.FC<PermissionErrorProps> = ({ error }) => {
  return (
    <Typography aria-label={"Permission Error"} variant="subtitle1" color="error" style={{ textAlign: "center", maxWidth: 500, margin: "20px auto" }}>
      {error}
    </Typography>
  );
};

export default PermissionError;
