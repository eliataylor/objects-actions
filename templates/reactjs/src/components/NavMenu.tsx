import React from 'react';
import {Link, useLocation} from 'react-router-dom';
import {List, ListItem, ListItemText} from '@mui/material';
import {NAVITEMS} from "../object-actions/types/types";

const NavMenu = () => {
    const location = useLocation();

    return <List>
        <ListItem component={Link} to="/" selected={location.pathname === '/'}>
            <ListItemText primary="Home"/>
        </ListItem>
        {NAVITEMS.map(item => {
            return <ListItem component={Link} to={item.screen} selected={location.pathname === item.screen}>
                <ListItemText primary={item.name}/>
            </ListItem>
        })}
    </List>
}
export default NavMenu;
