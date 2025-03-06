import React from "react";
import { GradientButton } from "./StyledFields";
import { SxProps, useTheme } from "@mui/system";

interface LogoProps {
  height?: number | string;
  width?: number | string;
  filter?: string;
}

const Logo: React.FC<LogoProps> = ({ height = "100%", width, filter }) => {
  const theme = useTheme();

  // Determine the shadow color based on the theme mode
  const shadowColor = theme.palette.mode === "dark"
    ? "rgba(255, 255, 255, 0.3)"  // Light shadow for dark mode
    : "rgba(114, 134, 71, 0.6)";  // Original color for light mode

  const toPass: { sx: SxProps } = {
    sx: {
      height: height,
      width: width || height, // If width is not provided, use height
      filter: filter || `drop-shadow(0 2px 2px ${shadowColor})`
    }
  };

  return <GradientButton sx={toPass.sx} />;
};

export default Logo;
