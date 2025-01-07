import React, { useContext } from 'react';
import { ThemeContext } from '../theme/ThemeContext';

interface LightDarkImgProps {
  light: string;
  dark: string;
  styles: any;
}

const LightDarkImg: React.FC<LightDarkImgProps> = ({ light, dark, styles }) => {
  const { darkMode } = useContext(ThemeContext);

  if (darkMode) return <img src={dark} alt={'Dark mode image'} {...styles} />;
  return <img src={light} alt={'Dark mode image'} {...styles} />;
};

export default LightDarkImg;
