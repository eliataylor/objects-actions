import React from 'react';
import {CircularProgress, Grid, Typography} from "@mui/material";
import Logo from "../theme/Logo";

interface PrivacyProps {
    section?: string;
}

const Privacy: React.FC<PrivacyProps> = ({section = 'privacy'}) => {

    return (
        <Grid id={"PrivacyScreen"} container direction={'column'} >
            <Grid item>
                <Logo height={80}/>
            </Grid>
            <Grid item>
                <Typography variant={'h4'}>Objects / Actions</Typography>
                <Typography variant={'body1'}>We do not sell any data, to anyone, for any reason, ever.</Typography>
                <Typography variant={'body2'}>We use cookies to track how visitors navigate this site and to track your session if you log in.</Typography>
            </Grid>
        </Grid>
    );
};

export default Privacy;
