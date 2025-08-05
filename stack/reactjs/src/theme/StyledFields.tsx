import React from "react";
import { alpha, darken, styled } from "@mui/material/styles";
import {Box, Button, ButtonProps, Drawer} from "@mui/material";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";

export const ButtonPill = styled((props: ButtonProps & { to?: string }) => {
  return <Button {...props} />;
})({
  borderRadius: 16,
  textTransform: "none",
  margin: "auto",
  maxWidth: 600
});

export const TightButton = styled(Button)(({ theme }) => ({
  borderRadius: 4,
  textTransform: "none",
  color: theme.palette.mode === "dark" ? theme.palette.text.primary : "",
  margin: "auto",
  minWidth: "auto",
  padding: "3px 5px"
}));

export const GradientButton = styled(IconButton)(({ theme }) => ({
  textTransform: "none",
  transition: "all .5s",
  background:
    theme.palette.mode === "dark" ?
      `linear-gradient(165deg, ${theme.palette.secondary.main}80, ${theme.palette.background.default} 45%, ${theme.palette.background.default} 55%, ${theme.palette.primary.main}80)`
      :
      `linear-gradient(145deg, ${theme.palette.secondary.light},  ${theme.palette.background.paper}, ${theme.palette.primary.light})`,
  color: theme.palette.text.primary,
  "&:hover": {
    transform: "rotate(34.5deg)",
    background: theme.palette.mode === "dark" ?
      `linear-gradient(165deg, ${theme.palette.secondary.main}80, ${theme.palette.background.default} 45%, ${theme.palette.background.default} 55%, ${theme.palette.primary.main}80)`
      :
      `linear-gradient(145deg, ${theme.palette.secondary.dark},  ${theme.palette.background.paper}, ${theme.palette.primary.dark})`
  }
}));


export const FadedPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(
    107deg,
    ${theme.palette.background.paper} 0%,
    ${theme.palette.background.paper}B3 30%, /* 70% opacity */
    ${theme.palette.background.default}00 70%   /* 0% opacity */
  )`
}));

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    background:
      "linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0))",
    color: "white", // Optional: set text color to white for better contrast
    borderRight: "1px solid rgba(255, 255, 255, 0.12)" // Optional: add border for better visibility
  }
}));

export const MountedDrawer = styled(Box)(({ theme }) => ({
  height: "100%",
  "& .MuiDrawer-paper": {
    background:
      "linear-gradient(to bottom, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0))",
    color: "white", // Optional: set text color to white for better contrast
    borderRight: "1px solid rgba(255, 255, 255, 0.12)" // Optional: add border for better visibility
  }
}));

export const AlternatingList = styled(Grid)(({ theme }) => ({
  "& > *:nth-of-type(odd)": {
    padding: "1%",
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.background.paper, 0.08)
        : darken(theme.palette.background.paper, 0.025)
  },
  "& > *:nth-of-type(even)": {
    padding: "1%",
    backgroundColor: "inherit"
  }
}));
