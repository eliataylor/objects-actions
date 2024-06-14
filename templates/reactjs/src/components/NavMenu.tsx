import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {List, ListItem, ListItemText} from '@mui/material';
import {NAVITEMS} from "../types/object-actions";

const NavMenu = () => {
    const location = useLocation();

    return (
        <List>
            <ListItem component={Link} to="/" selected={location.pathname === '/Home'}>
                <ListItemText primary="Home"/>
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