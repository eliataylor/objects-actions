import { useAuth, useConfig } from "../allauth/auth";
import { Link, useLocation } from "react-router-dom";
import React from "react";
import { AccountCircle, AlternateEmail, AppRegistration, DevicesOther, ExpandLess, ExpandMore, Login, Logout, Password, SwitchAccount, VpnKey } from "@mui/icons-material";
import { Collapse, List, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";

interface PermissionProps {
  to: string;
  icon?: string | React.ReactNode;
  name?: string;
}

export const NavBarItem: React.FC<PermissionProps> = (props) => {
  const location = useLocation();
  const isActive = location.pathname === props.to;
  return props.to.indexOf("http://") === 0 ||
  props.to.indexOf("https://") === 0 ? (
    <ListItemButton dense={true} selected={isActive} alignItems={"center"}>
      {props.icon && (
        <ListItemAvatar sx={{ minWidth: 40 }}>{props.icon}</ListItemAvatar>
      )}
      <a
        target={"_blank"}
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
      to={props.to}
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
  const me = useAuth()?.data?.user;
  const location = useLocation();
  const config = useConfig();

  const [open, setOpen] = React.useState(location.pathname === `/users/${me?.id}` || location.pathname.startsWith("/allauth"));

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div id={"AuthMenu"}>
      {me && me?.id ? <React.Fragment>
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
              to={`/users/${me.id}`}
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
            {config.data.socialaccount ? (
              <NavBarItem
                to="/account/providers"
                icon={<SwitchAccount fontSize={"small"} />}
                name="Providers"
              />
            ) : null}
            {config.data.mfa ? (
              <NavBarItem
                to="/account/2fa"
                icon={<VpnKey fontSize={"small"} />}
                name="Two-Factor Authentication"
              />
            ) : null}

            {config.data.usersessions ? (
              <NavBarItem
                to="/account/sessions"
                icon={<DevicesOther fontSize={"small"} />}
                name="Sessions"
              />
            ) : null}
            <NavBarItem
              to="/account/logout"
              icon={<Logout fontSize={"small"} />}
              name="Sign Out"
            />
          </List>
        </Collapse>
      </React.Fragment> : <React.Fragment>
        <NavBarItem
          to="/account/login"
          icon={<Login fontSize={"small"} color={"secondary"} />}
          name="Sign In"
        />
        <NavBarItem
          to="/account/signup"
          icon={<AppRegistration color={"secondary"} fontSize={"small"} />}
          name="Sign Up"
        />
      </React.Fragment>}
    </div>
  );
}
