import React from 'react';
import { Link } from 'react-router-dom';
import IconButton from "@mui/material/IconButton";
import { GradientButton } from "./StyledFields";

interface LogoProps {
  height?: number;
}

const Logo: React.FC<LogoProps> = (props) => {
  const toPass = {
    sx: {
      height: 'auto!important',
      filter: `drop-shadow(0 2px 2px rgba(114, 134, 71, 0.6))`,
    },
  };
  if (props.height && props.height > 0) {
    // @ts-ignore
    toPass.sx.fontSize = props.height;
    // @ts-ignore
    toPass.sx.height = 'auto';
  }

  return (
    <Link to={'/'}>
      <GradientButton
        color={'secondary'}
        sx={{ minWidth:30, minHeight:30, maxWidth:30, maxHeight:30, borderRadius:30, padding:2, }}
      >

      </GradientButton>
    </Link>
  );
};

export default Logo;
