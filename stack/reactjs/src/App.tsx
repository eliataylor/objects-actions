import * as React from "react";
import Router from "./Router";
import { ThemeProvider } from "./theme/ThemeContext";
import { NavDrawerProvider } from "./NavDrawerProvider";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AuthContextProvider } from "./allauth/auth";
import { SnackbarProvider } from "notistack";
import { EnvProvider } from "./object-actions/forming/EnvProvider";

export default function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
      >
        <EnvProvider>
          <AuthContextProvider>
            <NavDrawerProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Router />
              </LocalizationProvider>
            </NavDrawerProvider>
          </AuthContextProvider>
        </EnvProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
