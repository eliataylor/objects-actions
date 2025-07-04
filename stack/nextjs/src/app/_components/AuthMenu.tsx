"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { 
  AccountCircle, 
  AlternateEmail, 
  AppRegistration, 
  DevicesOther, 
  ExpandLess, 
  ExpandMore, 
  Login, 
  Logout, 
  Password, 
  SwitchAccount, 
  VpnKey 
} from "@mui/icons-material";
import { 
  Collapse, 
  List, 
  ListItemAvatar, 
  ListItemButton, 
  ListItemText 
} from "@mui/material";

interface NavBarItemProps {
  to: string;
  icon?: string | React.ReactNode;
  name?: string;
}

export const NavBarItem: React.FC<NavBarItemProps> = (props) => {
  const pathname = usePathname();
  const isActive = pathname === props.to;
  
  return props.to.indexOf("http://") === 0 ||
  props.to.indexOf("https://") === 0 ? (
    <ListItemButton dense={true} selected={isActive} alignItems={"center"}>
      {props.icon && (
        <ListItemAvatar sx={{ minWidth: 40 }}>{props.icon}</ListItemAvatar>
      )}
      <a
        target={"_blank"}
        rel="noopener noreferrer"
        style={{ textDecoration: "none", fontSize: 12 }}
        href={props.to}
      >
        {props.name}
      </a>
    </ListItemButton>
  ) : (
    <ListItemButton
      dense={true}
      component={Link}
      href={props.to}
      selected={isActive}
      alignItems={"center"}
    >
      {props.icon && (
        <ListItemAvatar sx={{ minWidth: 40 }}>{props.icon}</ListItemAvatar>
      )}
      <ListItemText primary={props.name} />
    </ListItemButton>
  );
};

export default function AuthMenu() {
  const pathname = usePathname();

  const userId = 0; // TODO: replace with session provider
  const isAuthenticated = false;

  const [open, setOpen] = React.useState(pathname === `/users/${userId}` || pathname.startsWith("/account"));

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div id={"AuthMenu"}>
      {isAuthenticated ? (
        <React.Fragment>
          <ListItemButton
            dense={true}
            style={{ justifyContent: "space-between" }}
            onClick={handleClick}
          >
            <ListItemText primary="My Account" />
            {open ? (
              <ExpandLess fontSize={"small"} />
            ) : (
              <ExpandMore fontSize={"small"} />
            )}
          </ListItemButton>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" sx={{ pl: 1 }}>
              <NavBarItem
                to={`/users/${userId}`}
                icon={<AccountCircle fontSize={"small"} />}
                name="My Profile"
              />
              <NavBarItem
                to="/account/email"
                icon={<AlternateEmail fontSize={"small"} />}
                name="Change Email"
              />
              <NavBarItem
                to="/account/password/change"
                icon={<Password fontSize={"small"} />}
                name="Change Password"
              />
              <NavBarItem
                to="/account/providers"
                icon={<SwitchAccount fontSize={"small"} />}
                name="Providers"
              />
              <NavBarItem
                to="/account/2fa"
                icon={<VpnKey fontSize={"small"} />}
                name="Two-Factor Authentication"
              />
              <NavBarItem
                to="/account/sessions"
                icon={<DevicesOther fontSize={"small"} />}
                name="Sessions"
              />
              <NavBarItem
                to="/api/auth/signout"
                icon={<Logout fontSize={"small"} />}
                name="Sign Out"
              />
            </List>
          </Collapse>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <NavBarItem
            to="/api/auth/signin"
            icon={<Login fontSize={"small"} color={"secondary"} />}
            name="Sign In"
          />
          <NavBarItem
            to="/account/signup"
            icon={<AppRegistration color={"secondary"} fontSize={"small"} />}
            name="Sign Up"
          />
        </React.Fragment>
      )}
    </div>
  );
} 