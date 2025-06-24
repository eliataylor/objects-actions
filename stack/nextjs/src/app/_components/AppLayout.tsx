"use client";

import React, { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Box, Divider, Fab, List, Popover } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/material/styles";
import { useNavDrawer } from "~/contexts/NavDrawerContext";
import { StyledDrawer } from "~/styles/StyledFields";
import OaMenu from "../_docs/OaMenu";
import ContentMenu from "./ContentMenu";
import AuthMenu, { NavBarItem } from "./AuthMenu";
import AllMenus from "./AllMenus";
import LogoGeneric from "../_docs/LogoGeneric";
import OALogo from "../_docs/OALogo";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 0.2, 0, 1),
  justifyContent: "space-between"
}));

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ 
  children
}) => {
  const pathname = usePathname();
  const { navDrawerWidth, setNavDrawerWidth, isMobile } = useNavDrawer();
  
  const [oaAnchorEl, setOAAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleOAClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOAAnchorEl(event.currentTarget);
  };

  const handleOAClose = () => {
    setOAAnchorEl(null);
  };

  const openOAMenu = Boolean(oaAnchorEl);

  const handleDrawerOpen = () => {
    setNavDrawerWidth(300);
  };

  const handleDrawerClose = () => {
    setNavDrawerWidth(0);
  };

  const isOaPage = useCallback((): boolean => {
    return pathname.indexOf("/oa/") === 0 || pathname === "/";
  }, [pathname]);

  function formatPathnameToDocTitle(pathname: string) {
    // Remove leading and trailing slashes, then split by remaining slashes
    const segments = pathname.replace(/^\/|\/$/g, "").split("/");

    // Capitalize each segment
    const capitalizedSegments = segments.map(segment => {
      if (!segment) return "";
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    });

    // Reverse the order and join with spaces
    return capitalizedSegments.reverse().join(" ").trim();
  }

  useEffect(() => {
    handleOAClose();
    if (isOaPage() === true) {
      document.title = `O/A ${formatPathnameToDocTitle(pathname.replace("/oa", ""))}`;
    } else {
      document.title = formatPathnameToDocTitle(pathname);
    }
  }, [pathname, isOaPage]);

  const MainLogo = isOaPage() ? OALogo : LogoGeneric;

  return (
    <React.Fragment>
      <Box sx={{ display: "flex", flexWrap: "nowrap", justifyContent: "space-around" }}>
        {isMobile === false && (
          <React.Fragment>
            <Fab
              aria-label={"Menu Context Popup"}
              aria-describedby={"OA Menu Popup"}
              onClick={handleOAClick}
              color="primary"
              size="small"
              sx={{ position: "fixed", backgroundColor: "background.paper", padding: .2, left: 8, bottom: 8 }}
            >
              {isOaPage() ? <LogoGeneric size={24} /> : <OALogo size={20} />}
            </Fab>
            <Popover
              id={"OA Menu Popup"}
              open={openOAMenu}
              anchorEl={oaAnchorEl}
              onClose={handleOAClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right"
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
            >
              <Box p={1}>
                {!isOaPage() ? <OaMenu handleClick={() => null} /> : <ContentMenu />}
              </Box>
            </Popover>
            
            <Box
              aria-label={"Menu Mounted"}
              sx={{ ml: 2, mt: 3, maxWidth: 240, minWidth: 181 }}
            >
              {isOaPage() ? (
                <NavBarItem
                  to={`/`}
                  icon={<OALogo size={20} />}
                  name="Objects / Actions"
                />
              ) : (
                <NavBarItem
                  to={`/content`}
                  icon={<LogoGeneric size={20} />}
                  name="Your Content"
                />
              )}

              <AuthMenu />

              <Divider
                sx={{
                  marginTop: 1,
                  backgroundColor: "primary.dark"
                }}
              />

              <List dense={true}>
                {isOaPage() ? <OaMenu handleClick={() => null} /> : <ContentMenu />}
              </List>
            </Box>
          </React.Fragment>
        )}

        <Box sx={{ flexGrow: 1 }}>
          {isMobile === true && (
            <AppBar position="fixed" color={"default"}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: 1,
                  gap: 2
                }}
              >
                <Box>
                  <Link href={"/"}>
                    <MainLogo size={35} />
                  </Link>
                </Box>
                <Box sx={{ flexGrow: 1 }}></Box>
                <Box>
                  <IconButton
                    size={"large"}
                    aria-label="Open Drawer"
                    onClick={handleDrawerOpen}
                  >
                    <MenuIcon color={"secondary"} />
                  </IconButton>
                </Box>
              </Box>
            </AppBar>
          )}
          <Box
            style={{
              width: "100%",
              margin: `${!isMobile ? 0 : "100px"} auto 0 auto`,
              padding: "1%",
              maxWidth: 1224
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {isMobile === true && (
        <StyledDrawer
          id={"MobileDrawer"}
          anchor="right"
          variant="temporary"
          open={navDrawerWidth > 0}
          ModalProps={{
            keepMounted: !isMobile
          }}
          onClose={handleDrawerClose}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: navDrawerWidth
            }
          }}
        >
          <DrawerHeader>
            <MainLogo size={34} />
            <IconButton aria-label={"Close Drawer"} onClick={handleDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
          </DrawerHeader>
          <AllMenus 
            isAuthenticated={isAuthenticated}
            isAdmin={isAdmin}
            userName={userName}
            userId={userId}
          />
        </StyledDrawer>
      )}
    </React.Fragment>
  );
};

export default AppLayout; 