import React from 'react';
import {Box, Divider} from '@mui/material';
import ThemeSwitcher from "../theme/ThemeSwitcher";
import NavMenu from "./NavMenu";
import ViewFormats from "../object-actions/forms/ViewFormats";

const DrawerMenu = () => {

    return (
        <Box sx={{padding: 1}}>

            <NavMenu/>

            <Divider sx={{margin: 1, backgroundColor: "primary.dark"}}/>

            <ThemeSwitcher/>

        </Box>
    );
};

export default DrawerMenu;
