import React from 'react'
import {Link, useLocation} from 'react-router-dom'
import {Collapse, Divider, List, ListItemAvatar, ListItemButton, ListItemText} from '@mui/material'
import {NAVITEMS} from '../object-actions/types/types'
import AuthMenu from '../components/AuthMenu'
import {useObjectActions} from "../object-actions/ObjectActionsProvider";
import {ExpandLess, ExpandMore} from "@mui/icons-material";
import OALogo from "../object-actions/docs/OALogo";
import OaMenu from "../object-actions/docs/OaMenu";

const NavMenu = () => {
    const location = useLocation()
    const {setNavOADrawerWidth} = useObjectActions()
    const [objectsOpen, setObjectsOpen] = React.useState(false);
    const [oaMenuOpen, setOAMenuOpen] = React.useState(false);

    const handleClick = () => {
        setObjectsOpen(!objectsOpen);
    };


    return (
        <React.Fragment>
            <List id={"NavMenu"} dense={true}>
                <AuthMenu/>

                <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

                <ListItemButton dense={true} style={{justifyContent: 'space-between'}} onClick={handleClick}>
                    <ListItemText primary="Objects"/>
                    {objectsOpen ? <ExpandLess fontSize={'small'}/> : <ExpandMore fontSize={'small'}/>}
                </ListItemButton>
                <Collapse in={objectsOpen} timeout="auto" unmountOnExit>
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
            </List>

            <Divider sx={{marginBottom: 1, marginTop: 1, backgroundColor: "primary.dark"}}/>

            <List dense={true}>
                <ListItemButton onClick={() => setOAMenuOpen(!oaMenuOpen)}>
                    <ListItemAvatar sx={{minWidth: 40}}>
                        <OALogo height={24}/>
                    </ListItemAvatar>
                    <ListItemText primary={"O/A Menu"}/>
                </ListItemButton>

                <Collapse in={oaMenuOpen} timeout="auto" unmountOnExit>
                    <OaMenu handleClick={() => null}/>
                </Collapse>
            </List>

        </React.Fragment>
    )
}
export default NavMenu
