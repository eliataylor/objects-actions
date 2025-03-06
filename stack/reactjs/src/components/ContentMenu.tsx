import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ListItemButton, ListItemText } from "@mui/material";
import { NAVITEMS } from "../object-actions/types/types";

const ContentMenu = () => {
  const location = useLocation();

  return (<div id={"OAMenuListItems"}>
      {NAVITEMS.map((item) => {
//               if (item.model_type === 'vocabulary') return null
        return (
          <ListItemButton
            key={`ContentMenu-${item.segment}`}
            component={Link}
            to={`/${item.segment}`}
            selected={location.pathname === `/${item.segment}`}
          >
            <ListItemText primary={item.plural} />
          </ListItemButton>
        );
      })}
    </div>
  );
};
export default ContentMenu;
