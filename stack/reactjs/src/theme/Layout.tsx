import React, { useCallback, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AppBar, Box, Divider, Fab, Grid, List, Popover } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/material/styles";
import Logo from "./Logo";
import { useNavDrawer } from "../NavDrawerProvider";
import Snackbar from "@mui/material/Snackbar";
import OALogo from "../object-actions/docs/OALogo";
// import TrackingConsent from "../components/TrackingConsent"; // enable this if your publishing features in an area that require a cookie consent
import { StyledDrawer } from "./StyledFields";
import OaMenu from "../object-actions/docs/OaMenu";
import ContentMenu from "../components/ContentMenu";
import AuthMenu, { NavBarItem } from "../components/AuthMenu";
import AllMenus from "../components/AllMenus";
// import FirstVisit from "../object-actions/components/FirstVisit";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 0.2, 0, 1),
  justifyContent: "space-between"
}));

const Layout: React.FC = () => {
  const location = useLocation();
  const { navDrawerWidth, setNavDrawerWidth, isMobile } = useNavDrawer();
  const [snack, showSnackBar] = React.useState("");

  const [oaAnchorEl, setOAAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleOAClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOAAnchorEl(event.currentTarget);
  };

  const handleOAClose = () => {
    setOAAnchorEl(null);
  };

  const openOAMenu = Boolean(oaAnchorEl);

  const closeSnackbar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    showSnackBar("");
  };

  const handleDrawerOpen = () => {
    setNavDrawerWidth(300);
  };

  const handleDrawerClose = () => {
    setNavDrawerWidth(0);
  };

  const isOaPage = useCallback((): boolean => {
    return location.pathname.indexOf("/oa/") === 0 || location.pathname === "/";
  }, [location.pathname]);

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
      document.title = `O/A ${formatPathnameToDocTitle(location.pathname.replace("/oa", ""))}`;
    } else {
      document.title = formatPathnameToDocTitle(location.pathname);
    }
  }, [location.pathname, isOaPage]);

  const MainLogo = isOaPage() ? OALogo : Logo;

  return (
    <React.Fragment>
      <Snackbar
        open={snack.length > 0}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        message={snack}
      />

      {/* enable this if your publishing features in an area that require a cookie consent
      <TrackingConsent />
      */}

      <Grid container justifyContent={"space-around"} flexWrap={"nowrap"}>
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
              {isOaPage() ? <Logo /> : <OALogo filter={"none"} />}

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
            <Grid
              aria-label={"Menu Mounted"}
              item
              sx={{ ml: 2, mt: 3 }}
              style={{ maxWidth: 240, minWidth: 181 }}
            >
              {isOaPage() ?
                <NavBarItem
                  to={`/`}
                  icon={<OALogo height={20} />}
                  name="Objects / Actions"
                />
                :

                <NavBarItem
                  to={`/content`}
                  icon={<Logo height={20} />}
                  name="Your Content"
                />
              }

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
            </Grid>
          </React.Fragment>)
        }

        <Grid item flexGrow={1}>
          {isMobile === true &&
            <AppBar position="fixed" color={"default"}>
              <Grid
                container
                justifyContent={"space-between"}
                alignItems={"center"}
                padding={1}
                spacing={2}
              >
                <Grid item>
                  <Link to={"/"}>
                    <MainLogo height={35} />
                  </Link>
                </Grid>
                <Grid item style={{ flexGrow: 1 }}></Grid>
                <Grid item>
                  <IconButton
                    size={"large"}
                    aria-label="Open Drawer"
                    onClick={handleDrawerOpen}
                  >
                    <MenuIcon color={"secondary"} />
                  </IconButton>
                </Grid>
              </Grid>
            </AppBar>}
          <Box
            style={{
              width: "100%",
              margin: `${!isMobile ? 0 : "100px"} auto 0 auto`,
              padding: "1%",
              maxWidth: 1224
            }}
          >
            <Outlet />
          </Box>
        </Grid>
      </Grid>

      {isMobile === true &&
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
            <MainLogo height={34} />
            <IconButton aria-label={"Close Drawer"} onClick={handleDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
          </DrawerHeader>
          <AllMenus />
        </StyledDrawer>
      }

    </React.Fragment>
  );
};

export default Layout;
