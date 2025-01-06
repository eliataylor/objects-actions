import * as React from 'react';
import Router from './Router';
import ObjectActionsProvider from './object-actions/ObjectActionsProvider';
import { ThemeProvider } from './theme/ThemeContext';
import { NavDrawerProvider } from './NavDrawerProvider';
import TrackingConsent from './components/TrackingConsent';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthContextProvider } from './allauth/auth';
import { SnackbarProvider } from 'notistack';
import { EnvProvider } from './object-actions/EnvProvider';

export default function App() {
  return (
    <ThemeProvider>
      <SnackbarProvider
        maxSnack={4}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        style={{ marginBottom: 50 }}
      >
        <EnvProvider>
          <AuthContextProvider>
            <NavDrawerProvider>
              <ObjectActionsProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Router />
                </LocalizationProvider>
              </ObjectActionsProvider>
            </NavDrawerProvider>
          </AuthContextProvider>
        </EnvProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
