// ThemeContext.js
import React, {createContext, useMemo, useState} from 'react';
import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {green, orange} from '@mui/material/colors';

import GlobalStyles from './GlobalStyles'; // Import the global styles
const ThemeContext = createContext();

const ThemeProvider = ({children}) => {
    const [darkMode, setDarkMode] = useState(false);

    const theme = useMemo(
        () => {

            const plt = {
//                mode: darkMode ? 'dark' : 'light',
//                mode : 'light',
                background: {
                    default: darkMode ? '#3B5700' : '#ffffff',
                    paper: darkMode ? '#3B5700' : '#F5F5F5',
                },
                contrastText: darkMode ? '#e1e1e1' : '#202020',
                text: {
                    primary: darkMode ? '#FFFFFF' : '#202020',
//                    secondary: '#bf741f',
                },
                grey : {
                    500: '#9e9e9e'
                },
                /*
                // for meals: F5F5F5

                color: theme.palette.getContrastText(theme.palette.primary.main),
                 */
                primary: {
                    main: darkMode ? '#202020' : '#3B5700',
                },
                secondary: {
                    main: '#bf741f'
                },
                warning: {
                    main: orange[500],
                },
                success: {
                    main: green[500],
                },
                link: {
                    main: darkMode ? '#b6b6b6' : '#3B5700',
                }
            }

            return createTheme({
                typography: {
                    fontFamily: 'Jost, Arial, sans-serif',
                },
                palette: plt
            })
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
