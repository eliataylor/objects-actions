import React from "react";
import { alpha, darken, styled } from "@mui/material/styles";
import { Button, ButtonProps, Drawer } from "@mui/material";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";

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
  margin: "auto"
}));

export const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 4,
  textTransform: "none",
  transition: "all 1s",
  background: `linear-gradient(165deg, ${theme.palette.secondary.main}80, ${theme.palette.background.default}, ${theme.palette.background.default}, ${theme.palette.primary.main}80)`,
  color: theme.palette.text.primary,
  "&:hover": {
    background: `linear-gradient(150deg, ${theme.palette.secondary.main}, ${theme.palette.background.default}, ${theme.palette.primary.main})`,
  }
}));

export const FadedPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(
    180deg,
    ${theme.palette.background.default} 0%,
    ${theme.palette.background.default}B3 70%, /* 70% opacity */
    ${theme.palette.background.paper}00 100%   /* 0% opacity */
  )`,
  "&:hover": {
    background: `linear-gradient(
        180deg,
        ${theme.palette.background.default} 0%,
        ${theme.palette.background.default}B3 40%, /* 70% opacity */
        ${theme.palette.background.paper}00 100%   /* 0% opacity */
    )`
  }
}));

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
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
