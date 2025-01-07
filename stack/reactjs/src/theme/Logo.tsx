import React from 'react';
import { Link } from 'react-router-dom';
import { GradientButton } from './StyledFields';

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
        variant={'outlined'}
        color={'secondary'}
        sx={{ fontSize: 9, width: '100%' }}
      >
        Your Logo
      </GradientButton>
    </Link>
  );
};

export default Logo;
