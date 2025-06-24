import React, { useEffect } from "react";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import { useThemeContext } from "../../contexts/ThemeContext";

const GoogleFontIcon = ({ height, width }: { height: number; width: number }) => (
  <svg viewBox="0 0 509.58086729 397.8808683" height={height} width={width} xmlns="http://www.w3.org/2000/svg">
    <path d="m0 387.4 245.52-385.39 131.6 83.84-192.11 301.55z" fill="#fbbc04"/>
    <path d="m240.33 0h151.13v387.4h-151.13z" fill="#1a73e8"/>
    <circle cx="83.72" cy="81.35" fill="#ea4335" r="74.91"/>
    <path d="m499.1 279.76a107.64 107.64 0 0 1 -107.64 107.64v-215.27a107.64 107.64 0 0 1 107.64 107.63z" fill="#34a853"/>
    <path d="m391.46 172.13v215.27a107.64 107.64 0 0 1 0-215.27z" fill="#0d652d"/>
    <path d="m474.3 89.29a82.85 82.85 0 0 1 -82.84 82.84v-165.69a82.85 82.85 0 0 1 82.84 82.85z" fill="#1a73e8"/>
    <path d="m391.46 6.44v165.69a82.85 82.85 0 0 1 0-165.69z" fill="#174ea6"/>
  </svg>
);


type GoogleFont = {
  family: string;
  variants: string;
};

const ALLFONTS: GoogleFont[] = [
  { family: "Roboto", variants: "Roboto:ital,wght@0,100..900;1,100..900" },
  { family: "Roboto Condensed", variants: "Roboto+Condensed:ital,wght@0,100..900;1,100..900" },
  { family: "Jost", variants: "Jost:ital,wght@0,100..900;1,100..900" },
  { family: "Noto Serif", variants: "Noto+Serif:ital,wght@0,100..900;1,100..900" },
  { family: "Merienda", variants: "Merienda:wght@300..900" },
//  { family: "The Nautigal", variants: "The+Nautigal:wght@400;700" },
//  { family: "Mea Culpa", variants: "Mea+Culpa" },
//  { family: "The Nautigal", variants: "Italianno" },
  { family: "IBM Plex Serif", variants: "IBM+Plex+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700" }
];

const FontSelector: React.FC = () => {
  const { fontFamily, setFamily } = useThemeContext();

  useEffect(() => {
    const font = ALLFONTS.find((f) => f.family === fontFamily);
    if (!font) return;

    const fontUrl = `https://fonts.googleapis.com/css2?family=${font.variants}&display=swap`;

    const linkElement = document.getElementById("GoogleFontFamily");
    if (linkElement) {
      linkElement.setAttribute("href", fontUrl);
      linkElement.setAttribute("rel", "stylesheet");
    }
  }, [fontFamily]);

  return (
    <TextField
      select
      size={"small"}
      label={"Font"}
      variant={"outlined"}
      value={fontFamily}
      onChange={(e) => {
        window.localStorage.setItem("themeFont", e.target.value);
        setFamily(e.target.value);
      }}
      fullWidth
      InputProps={{
        sx: { fontSize: 12 },
        startAdornment: (
          <InputAdornment position="start">
            <GoogleFontIcon height={15} width={15} />
          </InputAdornment>
        )
      }}
    >
      {ALLFONTS.map((font) => (
        <MenuItem key={font.family} value={font.family}>
          {font.family}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FontSelector;
