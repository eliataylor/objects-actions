import React from 'react';
import {Box, Divider, List, ListItemButton, ListItemText} from '@mui/material';
import ThemeSwitcher from "../../theme/ThemeSwitcher";
import {Link, useLocation} from "react-router-dom";

const OaMenu = () => {

    const location = useLocation()

    return (
        <Box sx={{padding: 1}}>

            <List id={"OaMenu"}>

                <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

                <ListItemButton component={Link} to={'/readme'}
                                selected={location.pathname === '/readme'}
                >
                    <ListItemText primary={"Read Me"}/>
                </ListItemButton>

                <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

                <ThemeSwitcher/>

            </List>

            <Divider/>

            <ThemeSwitcher/>


        </Box>
    );
};

export default OaMenu;
