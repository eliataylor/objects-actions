import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { NAVITEMS } from "../object-actions/types/types";
import MuiIcon from "./MuiIcon";
import { useNavDrawer } from "../NavDrawerProvider";

interface ContentTypesHomeProps {
  showLine2?: boolean;
}

const ContentMenu: React.FC<ContentTypesHomeProps> = ({ showLine2 = undefined }) => {
  const location = useLocation();
  const { navModelTypes } = useNavDrawer();

  return (<div id={"OAMenuListItems"}>
      {NAVITEMS.map((item) => {
        const type = item.model_type ? item.model_type : "contenttype";
        if (navModelTypes.indexOf(type) === -1) return null;
        return (
          <ListItemButton
            key={`ContentMenu-${item.segment}`}
            component={Link}
            to={`/${item.segment}`}
            selected={location.pathname === `/${item.segment}`}
          >
            {item.icon && <ListItemAvatar style={{ display: "flex" }}><MuiIcon fontSize={"small"} icon={item.icon} /></ListItemAvatar>}
            <ListItemText primary={item.plural} />
          </ListItemButton>
        );
      })}
    </div>
  );
};
export default ContentMenu;
