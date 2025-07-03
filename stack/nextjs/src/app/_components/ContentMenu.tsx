"use client";

import React from "react";
import { NAVITEMS } from "~/types/types";
import MuiIcon from "~/app/_components/MuiIcon";
import Link from "next/link";
import { ListItemButton, ListItemAvatar, ListItemText } from "@mui/material";

interface ContentMenuProps {
  navModelTypes?: string[];
}

const ContentMenu: React.FC<ContentMenuProps> = ({ 
  navModelTypes = ['contenttype'] 
}) => {
  return (
    <div id={"OAMenuListItems"}>
      {NAVITEMS.map((item) => {
        const type = item.model_type ? item.model_type : "contenttype";
        if (navModelTypes.indexOf(type) === -1) return null;
        
        return (
          <ListItemButton
            key={`ContentMenu-${item.segment}`}
            component={Link}
            href={`/${item.segment}`}
            dense={true}
            alignItems={"center"}
            sx={{
              // Active state styling using CSS - Next.js automatically adds aria-current="page"
              '&[aria-current="page"]': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
              },
              // Hover state
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            {item.icon && (
              <ListItemAvatar sx={{ minWidth: 40 }}>
                <MuiIcon fontSize={"small"} icon={item.icon} />
              </ListItemAvatar>
            )}
            <ListItemText primary={item.plural} />
          </ListItemButton>
        );
      })}
    </div>
  );
};

export default ContentMenu; 