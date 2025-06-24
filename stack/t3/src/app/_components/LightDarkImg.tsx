import React from "react";
import { useThemeContext } from "../../contexts/ThemeContext";

interface LightDarkImgProps {
  light: string;
  dark: string;
  styles: any;
}

const LightDarkImg: React.FC<LightDarkImgProps> = ({ light, dark, styles }) => {
  const { darkMode } = useThemeContext();

  if (darkMode) return <img src={dark} alt={"Dark mode"} style={styles} />;
  return <img src={light} alt={"Light mode"} style={styles} />;
};

export default LightDarkImg;
