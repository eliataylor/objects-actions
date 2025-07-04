import React from "react";
import { SvgIcon } from "@mui/material";
import type { SvgIconProps } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
// WARN: This will likely embed the entire icon library. Consider changing NAVITTEM.icon to the MUI Icon for tree shaking. 

interface DynamicMuiIconProps extends SvgIconProps {
  icon: string;
}

const MuiIcon: React.FC<DynamicMuiIconProps> = ({ icon, ...props }) => {
  // Get the icon component from the static imports
  const IconComponent = MuiIcons[icon as keyof typeof MuiIcons] as React.ComponentType<SvgIconProps> | undefined;

  if (!IconComponent) {
    console.warn(`MUI Icon "${icon}" not found.`);
    return <SvgIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

export default MuiIcon; 