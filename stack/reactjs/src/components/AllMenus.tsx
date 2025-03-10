import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Collapse, Divider, List, ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { NAVITEMS } from "../object-actions/types/types";
import AuthMenu from "../components/AuthMenu";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import OALogo from "../object-actions/docs/OALogo";
import OaMenu from "../object-actions/docs/OaMenu";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import ContentMenu from "./ContentMenu";
import Logo from "../theme/Logo";

const AllMenus = () => {
  const location = useLocation();
  const [objectsOpen, setObjectsOpen] = React.useState(false);
  const [oaMenuOpen, setOAMenuOpen] = React.useState(
    location.pathname.indexOf("/oa/") === 0
  );

  const handleClick = () => {
    setObjectsOpen(!objectsOpen);
  };

  return (
    <React.Fragment>
      <List id={"AllMenus"} dense={true} style={{marginBottom: 0, paddingBottom:0}}>
        <AuthMenu />

        <Divider
          sx={{
            marginTop: 1,
            backgroundColor: "primary.dark"
          }}
        />

        <ListItemButton
          dense={true}
          id={'OAMenuButton'}
          style={{ justifyContent: "space-between" }}
          onClick={handleClick}
        >
          <ListItemText primary="Your Content" />
          {objectsOpen ? (
            <ExpandLess fontSize={"small"} />
          ) : (
            <ExpandMore fontSize={"small"} />
          )}
        </ListItemButton>

        <Collapse in={objectsOpen} timeout="auto" unmountOnExit>
          <ContentMenu />
        </Collapse>

      </List>

      <Divider
        sx={{  backgroundColor: "primary.dark" }}
      />

      <List dense={true}>
        <ListItemButton onClick={() => setOAMenuOpen(!oaMenuOpen)}>
          <ListItemText primary={"Objects/Actions"} />
          {oaMenuOpen ? (
            <ExpandLess fontSize={"small"} />
          ) : (
            <ExpandMore fontSize={"small"} />
          )}
        </ListItemButton>

        <Collapse in={oaMenuOpen} timeout="auto" unmountOnExit>
          <OaMenu handleClick={() => null} />
        </Collapse>
      </List>

    </React.Fragment>
  );
};
export default AllMenus;
