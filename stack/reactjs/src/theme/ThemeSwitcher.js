// ThemeSwitcher.js
import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Typography } from '@mui/material';

const ThemeSwitcher = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const handleToggle = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <FormControlLabel
      size={'small'}
      label={
        <Typography variant={'body2'} style={{ fontSize: 12 }}>
          Dark Mode
        </Typography>
      }
      color={'primary'}
      control={
        <Switch
          size={'small'}
          color={'primary'}
          checked={darkMode}
          onChange={handleToggle}
        />
      }
    />
  );
};

export default ThemeSwitcher;
