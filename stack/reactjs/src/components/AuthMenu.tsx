import {useConfig, useUser} from '../allauth/auth'
import {Link, useLocation} from 'react-router-dom'
import React from "react";
import {
    AlternateEmail,
    AppRegistration,
    DevicesOther,
    ExpandLess,
    ExpandMore,
    Login,
    Logout,
    Password,
    Settings,
    SwitchAccount,
    VpnKey
} from "@mui/icons-material";
import {Collapse, List, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText} from "@mui/material";

interface PermissionProps {
    to: string;
    icon?: string | React.ReactNode;
    name?: string;
}

const NavBarItem: React.FC<PermissionProps> = (props) => {
    const location = useLocation()
    const isActive = location.pathname.startsWith(props.to)
    return (props.to.indexOf("http://") === 0 || props.to.indexOf("https://") === 0)
        ?
        <ListItemButton dense={true}  component={Link} to={props.to} selected={isActive} alignItems={'center'}>
            {props.icon && <ListItemAvatar sx={{minWidth:40}}>{props.icon}</ListItemAvatar>}
            <a target={'_blank'} href={props.to}>{props.name}</a>
        </ListItemButton>
        :
        <ListItemButton dense={true} component={Link} to={props.to} selected={isActive} alignItems={'center'}>
            {props.icon && <ListItemAvatar sx={{minWidth:40}}>{props.icon}</ListItemAvatar>}
            <ListItemText primary={props.name}/>
        </ListItemButton>
}

export default function AuthMenu() {
    const user = useUser()
    const config = useConfig()

    const [open, setOpen] = React.useState(false);

    const handleClick = () => {
        setOpen(!open);
    };

    const anonNav = (
        <>
            <NavBarItem to='/account/login' icon={<Login fontSize={'small'}/>} name='Sign In'/>
            <NavBarItem to='/account/signup' icon={<AppRegistration  fontSize={'small'}/>} name='Sign Up'/>
        </>
    )
    const authNav = (
        <React.Fragment>
            <ListItemButton dense={true} style={{justifyContent:'space-between'}} onClick={handleClick}>
                <ListItemText primary="My Account" />
                   {open ? <ExpandLess  fontSize={'small'}/> : <Settings  fontSize={'small'}/>}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" sx={{pl: 1}}>
                    <NavBarItem to='/account/email' icon={<AlternateEmail  fontSize={'small'}/>} name='Change Email'/>
                    <NavBarItem to='/account/password/change' icon={<Password  fontSize={'small'}/>} name='Change Password'/>
                    {config.data.socialaccount
                        ? <NavBarItem to='/account/providers' icon={<SwitchAccount  fontSize={'small'}/>} name='Providers'/>
                        : null}
                    {config.data.mfa
                        ? <NavBarItem to='/account/2fa' icon={<VpnKey  fontSize={'small'}/>} name='Two-Factor Authentication'/>
                        : null}

                    {config.data.usersessions
                        ? <NavBarItem to='/account/sessions' icon={<DevicesOther fontSize={'small'} />} name='Sessions'/>
                        : null}
                    <NavBarItem to='/account/logout' icon={<Logout fontSize={'small'}/>} name='Sign Out'/>
                </List>
            </Collapse>
        </React.Fragment>

    )
    return (
        <div id={"AuthMenu"}>
            {process.env.REACT_APP_DEBUG ? <NavBarItem to='http://localhost:1080' icon='✉️' name='MailCatcher'/> : null}
            {user ? authNav : anonNav}
        </div>
    )
}
