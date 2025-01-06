import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Collapse, Divider, List, ListItemAvatar, ListItemButton, ListItemText} from '@mui/material'
import {NAVITEMS} from '../object-actions/types/types'
import AuthMenu from '../components/AuthMenu'
import {useObjectActions} from "../object-actions/ObjectActionsProvider";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import OALogo from "../object-actions/docs/OALogo";

const NavMenu = () => {
    const location = useLocation()
    const {setNavOADrawerWidth} = useObjectActions()
    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };


    return (
        <List id={"NavMenu"} dense={true}>
            <AuthMenu/>

            <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

            <ListItemButton dense={true} style={{justifyContent: 'space-between'}} onClick={handleClick}>
                <ListItemText primary="Objects"/>
                {open ? <ExpandLess fontSize={'small'}/> : <ExpandMore fontSize={'small'}/>}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <div id={"ObjectTypesMenu"}>
                    {NAVITEMS.map(item => {
                        return (
                            <ListItemButton
                                key={`navmenu-${item.screen}`} component={Link} to={item.screen}
                                selected={location.pathname === item.screen}
                            >
                                <ListItemText primary={item.plural}/>
                            </ListItemButton>
                        )
                    })}
                </div>
            </Collapse>

            <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

            <ListItemButton onClick={() => setNavOADrawerWidth(180)}>
                <ListItemAvatar sx={{minWidth: 40}}>
                    <OALogo height={24} />
                </ListItemAvatar>
                <ListItemText primary={"O/A Menu"}/>
            </ListItemButton>

        </List>
    )
}
export default NavMenu
