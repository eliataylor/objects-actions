"use client";

import React from "react";
import { useThemeContext } from "../../contexts/ThemeContext";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

const ThemeSwitcher: React.FC = () => {
  const { darkMode, setDarkMode } = useThemeContext();

  return (
    <TextField
      select
      size={"small"}
      label={"Theme"}
      variant={"outlined"}
      value={darkMode.toString()}
      onChange={(e) => {
        const isDark = e.target.value === "true";
        window.localStorage.setItem("themeMode", e.target.value);
        setDarkMode(isDark);
      }}
      fullWidth
      InputProps={{
        sx: { fontSize: 12 },
        startAdornment: (
          <InputAdornment position="start">
            <SettingsBrightnessIcon fontSize={"small"} />
          </InputAdornment>
        )
      }}
    >
      <MenuItem value="true">
        Dark Mode
      </MenuItem>
      <MenuItem value="false">
        Light Mode
      </MenuItem>
    </TextField>
  );
};

export default ThemeSwitcher; 