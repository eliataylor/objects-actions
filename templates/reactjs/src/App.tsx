import * as React from 'react';
import Router from "./Router";
import ObjectActionsProvider from "./ObjectActionsProvider";
import {ThemeProvider} from "./theme/ThemeContext";
import {NavDrawerProvider} from "./NavDrawerProvider";
import TrackingConsent from "./components/TrackingConsent";
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';

export default function App() {

    return (<ThemeProvider>
            <NavDrawerProvider>
                <TrackingConsent/>
                <ObjectActionsProvider>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Router/>
                    </LocalizationProvider>
                </ObjectActionsProvider>
            </NavDrawerProvider>
        </ThemeProvider>
    );
}
