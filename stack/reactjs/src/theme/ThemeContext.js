// ThemeContext.js
import React, {createContext, useMemo, useState} from 'react';
import {createTheme, responsiveFontSizes, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {green, orange} from '@mui/material/colors';

import GlobalStyles from './GlobalStyles'; // Import the global styles
const ThemeContext = createContext();

const ThemeProvider = ({children}) => {
    const [darkMode, setDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

    const theme = useMemo(
        () => {

            const plt = {
                mode: darkMode ? 'dark' : 'light',
                background: {
                    default: darkMode ? '#000000' : '#ffffff',
                    paper: darkMode ? '#202020' : '#F5F5F5',
                },
                contrastText: darkMode ? '#e1e1e1' : '#202020',
                text: {
                    primary: darkMode ? '#ffffff' : '#202020',
                    secondary: darkMode ? '#dadada' : '#333333',
                },
                grey : {
                    500: '#9e9e9e'
                },
                /*
                // for meals: F5F5F5

                color: theme.palette.getContrastText(theme.palette.primary.main),
                 */
                primary: {
                    main: darkMode ? '#B70404' : '#8c0505',
                },
                secondary: {
                    main: darkMode ? '#1973af' : '#185C8A',
                },
                warning: {
                    main: orange[500],
                },
                success: {
                    main: green[500],
                },
                link: {
                    main: darkMode ? '#a6d8fb' : '#1973af',
                }
            }

            return responsiveFontSizes(createTheme({
                typography: {
                    fontSize: 12,
                },
                components: {
                    // Name of the component
                    MuiButton: {
                        styleOverrides: {
                            // Name of the slot
                            root: {
                                // Some CSS
                                textTransform: 'none',
                                variants: [
                                    {
                                        props: {variant: 'outlined'},
                                        style: {
                                            borderWidth: '.5px',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
                palette: plt
            }))
        },
        [darkMode]
    );

    console.log("THEME UPDATE", theme);

    return (
        <ThemeContext.Provider value={{darkMode, setDarkMode}}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <GlobalStyles/>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export {ThemeProvider, ThemeContext};
