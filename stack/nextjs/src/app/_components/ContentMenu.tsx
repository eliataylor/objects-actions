"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ListItemAvatar, ListItemButton, ListItemText } from "@mui/material";
import { NAVITEMS } from "~/types/types";
import { useNavDrawer } from "~/contexts/NavDrawerContext";
import MuiIcon from "~/app/_components/MuiIcon";

const ContentMenu: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { navModelTypes } = useNavDrawer();

  const handleNavClick = (segment: string) => {
    console.log(`[ContentMenu] Navigating to: /${segment}`);
    router.push(`/${segment}`);
  };

  return (
    <div id={"OAMenuListItems"}>
      {NAVITEMS.map((item) => {
        const type = item.model_type ? item.model_type : "contenttype";
        if (navModelTypes.indexOf(type) === -1) return null;
        return (
          <ListItemButton
            key={`ContentMenu-${item.segment}`}
            selected={pathname === `/${item.segment}`}
            sx={{ textDecoration: "none", color: "inherit" }}
            onClick={() => handleNavClick(item.segment)}
          >
            {item.icon && (
              <ListItemAvatar style={{ display: "flex" }}>
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