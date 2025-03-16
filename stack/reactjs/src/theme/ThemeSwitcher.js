// ThemeSwitcher.js
import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";

const ThemeSwitcher = () => {
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  return (
    <TextField
      select
      size={"small"}
      label={"Theme"}
      variant={"outlined"}
      value={darkMode}
      onChange={(e) => {
        window.localStorage.setItem("themeMode", e.target.value);
        setDarkMode(e.target.value);
      }}
      fullWidth
      InputProps={{
        sx: { fontSize: 12 },
        startAdornment: (
          <InputAdornment position="start">
            <SettingsBrightnessIcon size={"small"} />
          </InputAdornment>
        )
      }}
    >
      <MenuItem value={true}>
        Dark Mode
      </MenuItem>
      <MenuItem value={false}>
        Light Mode
      </MenuItem>
    </TextField>
  );
};

export default ThemeSwitcher;
