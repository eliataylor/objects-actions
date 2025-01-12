import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AppBar, Box, Grid } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { styled } from "@mui/material/styles";
import Logo from "./Logo";
import { useNavDrawer } from "../NavDrawerProvider";
import NavMenu from "../components/NavMenu";
import Snackbar from "@mui/material/Snackbar";
import OALogo from "../object-actions/docs/OALogo";
import TrackingConsent from "../components/TrackingConsent";
import { StyledDrawer } from "./StyledFields";
import FirstVisit from "../object-actions/components/FirstVisit";

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1, 0.2, 0, 1),
  justifyContent: "space-between"
}));

const Layout: React.FC = () => {
  const location = useLocation();
  const { navDrawerWidth, setNavDrawerWidth, isMounted } = useNavDrawer();
  const [snack, showSnackBar] = React.useState("");

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

  const MainLogo = location.pathname.indexOf("/oa/") === 0 ? OALogo : Logo;

  const appBar = (
    <AppBar position="fixed" color={"default"}>
      <Grid
        container
        justifyContent={"space-between"}
        alignItems={"center"}
        padding={1}
        spacing={2}
      >
        {location.pathname.length > 1 && (
          <Grid item>
            <Link to={"/"}>
              <MainLogo height={50} />
            </Link>
          </Grid>
        )}
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
    </AppBar>
  );

  return (
    <React.Fragment>
      <Snackbar
        open={snack.length > 0}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        message={snack}
      />
      <TrackingConsent />
      <FirstVisit />

      <Grid container justifyContent={"space-around"} flexWrap={"nowrap"}>
        {isMounted === true && (
          <Grid
            item
            sx={{ ml: 2, mt: 3 }}
            style={{ maxWidth: 240, minWidth: 140 }}
          >
            {location.pathname.length > 1 && <Logo height={45} />}
            <NavMenu />
          </Grid>
        )}
        <Grid item flexGrow={1}>
          {isMounted === false && appBar}
          <Box
            style={{
              width: "100%",
              margin: `${isMounted ? 0 : "100px"} auto 0 auto`,
              padding: "1%",
              maxWidth: 1024
            }}
          >
            <Outlet />
          </Box>
        </Grid>
      </Grid>

      <StyledDrawer
        anchor="right"
        variant="temporary"
        open={!isMounted && navDrawerWidth > 0}
        ModalProps={{
          keepMounted: isMounted
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
          <Logo height={80} />
          <IconButton aria-label={"Close Drawer"} onClick={handleDrawerClose}>
            <ChevronRightIcon />
          </IconButton>
        </DrawerHeader>
          <NavMenu />
      </StyledDrawer>
    </React.Fragment>
  );
};

export default Layout;
