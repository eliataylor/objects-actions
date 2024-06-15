import React, {useContext} from 'react';
import {Button, GlobalStyles} from '@mui/material';
import {styled, Theme} from '@mui/material/styles';
import {ThemeContext} from "./ThemeContext";

export const ThemedButton = styled(Button)(({ theme }) => {
    const { darkMode } = useContext(ThemeContext);

    return {
        fontWeight:700,
        letterSpacing:1.5,
        backgroundColor: darkMode === true ? '#ffffff' : '#202020',
        color: darkMode === true ? theme.palette.getContrastText('#ffffff') : theme.palette.getContrastText('#202020'),
        '&:hover': {
            backgroundColor: darkMode === true ? '#dcdcdc' : '#000000',
        },
    };
});

const GlobalLinkStyles: React.FC = () => (
    <GlobalStyles
        styles={(theme: Theme) => ({
            'a, a:visited': {
                color: 'inherit',
                // @ts-ignore
                // color: theme.palette.link.main,
                textDecoration: 'underline',
            },
            'a:hover, a:focus': {
                color: 'inherit',
                // color: theme.palette.link.dark,
                textDecoration: 'underline',
            },
        })}
    />
);

export default GlobalLinkStyles;
