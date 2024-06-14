import React, {useContext} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {List, ListItem, ListItemText} from '@mui/material';
import {useTheme} from "@mui/styles";
import {Theme} from "@mui/material/styles";
import {NAVITEMS} from "../types/object-actions";

const NavMenu = () => {
    const location = useLocation();
    const theme = useTheme() as Theme;

    return (
        <List>
            <ListItem component={Link} to="/home" selected={location.pathname === '/about'}>
                <ListItemText primary="ABOUT US"/>
            </ListItem>
            {NAVITEMS.map(item => {
                <ListItem component={Link} to={`/${item.path}`} selected={location.pathname === `/${item.path}`}>
                <ListItemText primary={item.name} />
            </ListItem>
            })}
        </List>
    );
};

export default NavMenu;