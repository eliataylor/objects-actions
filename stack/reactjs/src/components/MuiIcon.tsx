import React, { lazy, Suspense } from "react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { SvgIconTypeMap } from "@mui/material/SvgIcon";

const loadMuiIcon = (iconName: string) => {
  return lazy(() =>
    import("@mui/icons-material").then((module) => {
      const Icon = module[iconName as keyof typeof module] as
        | OverridableComponent<SvgIconTypeMap<Record<string, never> | object, "svg">>
        | undefined;
      if (!Icon) throw new Error(`MUI Icon "${iconName}" not found.`);
      return { default: Icon };
    })
  );
};

interface DynamicMuiIconProps extends SvgIconProps {
  icon: string;
}

const MuiIcon: React.FC<DynamicMuiIconProps> = ({ icon, ...props }) => {
  const IconComponent = loadMuiIcon(icon);

  return (
    <Suspense fallback={<SvgIcon {...props} />}>
      <IconComponent {...props} />
    </Suspense>
  );
};

export default MuiIcon;
