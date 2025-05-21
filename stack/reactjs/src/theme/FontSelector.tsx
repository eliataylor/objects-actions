import React, { useContext, useEffect } from "react";
import { InputAdornment, MenuItem, TextField } from "@mui/material";
import { ThemeContext } from "./ThemeContext";

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
  const { fontFamily, setFamily } = useContext(ThemeContext);

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
            <img alt="google fonts" height={15} src={"/oa-assets/google-fonts.svg"} />
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
