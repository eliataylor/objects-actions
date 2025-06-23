"use client"
import React, { useState, useEffect } from "react";
import { GradientButton } from "../../styles/StyledFields";
import { type SxProps, useTheme } from "@mui/system";

interface LogoProps {
  size?: number | string;
  filter?: string;
}

const Logo: React.FC<LogoProps> = ({ size = "30px", filter }) => {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only applying theme-dependent styles after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use a safe default for SSR, then apply theme-dependent styles after mount
  const shadowColor = mounted && theme.palette.mode === "dark"
    ? "rgba(255, 255, 255, 0.3)"  // Light shadow for dark mode
    : "rgba(114, 134, 71, 0.6)";  // Default/light mode shadow

  const toPass: { sx: SxProps } = {
    sx: {
      borderRadius: "40px",
      height: size,
      width: size,
      filter: filter || `drop-shadow(0 2px 2px ${shadowColor})`
    }
  };

  return <GradientButton sx={toPass.sx} />;
};

export default Logo;
