"use client"

import * as React from "react"
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import createCache from "@emotion/cache"
import { useServerInsertedHTML } from "next/navigation"
import { CacheProvider } from "@emotion/react"
import { createTheme, responsiveFontSizes } from "@mui/material/styles"
import { green, orange } from "@mui/material/colors"

// Theme and Font Context
interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  fontFamily: string;
  setFamily: (fontFamily: string) => void;
  isClient: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeRegistry");
  }
  return context;
};

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = React.useState(true); // Default to dark mode
  const [fontFamily, setFamily] = React.useState("Jost");
  const [isClient, setIsClient] = React.useState(false);

  // Initialize client-side state
  React.useEffect(() => {
    setIsClient(true);
    
    // Initialize dark mode from localStorage or system preference
    const savedThemeMode = localStorage.getItem("themeMode");
    if (savedThemeMode !== null) {
      setDarkMode(savedThemeMode !== "false");
    } else if (window.matchMedia) {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    
    // Initialize font family from localStorage
    const savedFont = localStorage.getItem("themeFont");
    if (savedFont) {
      setFamily(savedFont);
    }
  }, []);


  // Create theme based on current settings
  const theme = React.useMemo(() => {
    const palette = {
      mode: darkMode ? "dark" : "light",
      background: {
        default: darkMode ? "#000000" : "#ffffff",
        paper: darkMode ? "#202020" : "#F5F5F5"
      },
      contrastText: darkMode ? "#e1e1e1" : "#202020",
      text: {
        primary: darkMode ? "#ffffff" : "#202020",
        secondary: darkMode ? "#dadada" : "#333333"
      },
      grey: {
        500: "#9e9e9e"
      },
      primary: {
        main: darkMode ? "#B70404" : "#8c0505"
      },
      secondary: {
        main: darkMode ? "#1973af" : "#185C8A"
      },
      warning: {
        main: orange[500]
      },
      success: {
        main: green[500]
      },
      link: {
        main: darkMode ? "#a6d8fb" : "#1973af"
      }
    };

    return responsiveFontSizes(
      createTheme({
        typography: {
          fontFamily: fontFamily,
          fontSize: 15,
          h1: { fontSize: "3.5rem", fontWeight: fontFamily === "Jost" ? 200 : 100 },
          h2: { fontSize: "3.0rem", fontWeight: 200 },
          h3: { fontSize: "2.5rem", fontWeight: 300 },
          h4: { fontSize: "2.0rem", fontWeight: 400 },
          h5: { fontSize: "1.5rem", fontWeight: 500 },
          h6: { fontSize: "1.0rem", fontWeight: 600 },
          body1: { fontSize: "0.9rem", lineHeight: 1.5 },
          body2: { fontSize: "0.8rem", lineHeight: 1.4 },
          button: {
            fontSize: "0.8rem",
            textTransform: "none",
            textDecoration: "none"
          }
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: "none",
                variants: [
                  {
                    props: { variant: "outlined" },
                    style: {
                      borderWidth: ".5px"
                    }
                  }
                ]
              }
            }
          },
          MuiList: {
            styleOverrides: {
              root: {
                "&.alternatingbg .MuiListItem-root:nth-of-type(odd)": {
                  backgroundColor: "lightgray"
                },
                "&.alternatingbg .MuiListItem-root:nth-of-type(even)": {
                  backgroundColor: "white"
                },
                "&.alternatingbg .MuiListItem-root:hover": {
                  backgroundColor: "gray"
                }
              }
            }
          }
        },
        palette: palette as any
      })
    );
  }, [darkMode, fontFamily]);

  const options = { key: "mui" }
  const [{ cache, flush }] = React.useState(() => {
    const cache = createCache(options)
    cache.compat = true
    const prevInsert = cache.insert
    let inserted: string[] = []
    cache.insert = (...args) => {
      const serialized = args[1]
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name)
      }
      return prevInsert(...args)
    }
    const flush = () => {
      const prevInserted = inserted
      inserted = []
      return prevInserted
    }
    return { cache, flush }
  })

  useServerInsertedHTML(() => {
    const names = flush()
    if (names.length === 0) {
      return null
    }
    let styles = ""
    for (const name of names) {
      styles += cache.inserted[name]
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    )
  })

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, setFamily, fontFamily, isClient }}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  )
} 