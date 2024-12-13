import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Divider, List, ListItemButton, ListItemText} from '@mui/material'
import {NAVITEMS} from '../object-actions/types/types'
import ViewFormats from '../object-actions/forms/ViewFormats'
import AuthMenu from '../components/AuthMenu'
import ThemeSwitcher from "../theme/ThemeSwitcher";

const NavMenu = () => {
    const location = useLocation()

    return (
        <List id={"NavMenu"}>
            <AuthMenu/>

            <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

            {NAVITEMS.map(item => {
                return (
                    <ListItemButton
                        key={`navmenu-${item.screen}`} component={Link} to={item.screen}
                        selected={location.pathname === item.screen}
                    >
                        <ListItemText primary={item.name}/>
                    </ListItemButton>
                )
            })}

            <ThemeSwitcher />

        </List>
    )
}
export default NavMenu
