// ThemeSwitcher.js
import React, {useContext} from 'react';
import {ThemeContext} from './ThemeContext';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const ThemeSwitcher = () => {
    const { darkMode, setDarkMode } = useContext(ThemeContext);

    const handleToggle = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <FormControlLabel
            label={'Dark Mode'} color={'primary'}
            control={<Switch color={'primary'} checked={darkMode} onChange={handleToggle} />}
        />
    );
};

export default ThemeSwitcher;
