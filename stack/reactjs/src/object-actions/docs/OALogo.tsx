import React from "react";
import { SvgIcon } from "@mui/material";
import { ReactComponent as LOGO } from "./oa-logo.svg";

interface LogoProps {
  height?: number;
  filter?: string;
}

const Logo: React.FC<LogoProps> = (props) => {
  const toPass = {
    sx: {
      height: "auto!important",
      filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`
    }
  };
  if (props.height && props.height > 0) {
    // @ts-ignore
    toPass.sx.fontSize = props.height;
    // @ts-ignore
    toPass.sx.height = "auto";
  } else if (props.filter) {
    toPass.sx.filter = props.filter;
  }

  return (
    <SvgIcon
      viewBox="0 0 292 116"
      component={LOGO}
      {...toPass}
      inheritViewBox
    />
  );
};

export default Logo;
