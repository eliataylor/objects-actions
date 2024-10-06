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
        <ListItemButton component={Link} to={props.to} selected={isActive} alignItems={'center'}>
            {props.icon && <ListItemAvatar>{props.icon}</ListItemAvatar>}
            <a target={'_blank'} href={props.to}>{props.name}</a>
        </ListItemButton>
        :
        <ListItemButton component={Link} to={props.to} selected={isActive} alignItems={'center'}>
            {props.icon && <ListItemAvatar>{props.icon}</ListItemAvatar>}
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
            <NavBarItem to='/account/sms' icon={<Login/>} name='SMS Login'/>
            <NavBarItem to='/account/login' icon={<Login/>} name='Email Login'/>
            <NavBarItem to='/account/signup' icon={<AppRegistration/>} name='Email Signup'/>
            <NavBarItem to='/account/password/reset' icon={<Password/>} name='Reset password'/>
        </>
    )
    const authNav = (
        <React.Fragment>
            <ListItemButton onClick={handleClick}>
                <ListItemIcon>
                   {open ? <ExpandLess/> : <ExpandMore/>}
                </ListItemIcon>
                <ListItemText primary="My Account" sx={{marginRight:1}} />
                <Settings/>
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" sx={{pl: 1}}>
                    <NavBarItem to='/account/email' icon={<AlternateEmail/>} name='Change Email'/>
                    <NavBarItem to='/account/password/change' icon={<Password/>} name='Change Password'/>
                    {config.data.socialaccount
                        ? <NavBarItem to='/account/providers' icon={<SwitchAccount/>} name='Providers'/>
                        : null}
                    {config.data.mfa
                        ? <NavBarItem to='/account/2fa' icon={<VpnKey/>} name='Two-Factor Authentication'/>
                        : null}

                    {config.data.usersessions
                        ? <NavBarItem to='/account/sessions' icon={<DevicesOther/>} name='Sessions'/>
                        : null}
                    <NavBarItem to='/account/logout' icon={<Logout/>} name='Sign Out'/>
                </List>
            </Collapse>
        </React.Fragment>

    )
    return (
        <React.Fragment>
            {process.env.REACT_APP_DEBUG ? <NavBarItem to='http://localhost:1080' icon='✉️' name='MailCatcher'/> : null}
            {user ? authNav : anonNav}
        </React.Fragment>
    )
}
