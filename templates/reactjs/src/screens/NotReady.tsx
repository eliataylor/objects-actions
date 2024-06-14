import React from 'react';
import {Grid, Typography} from "@mui/material";

interface NotReady {
    title: string;
}

const NotReady: React.FC<NotReady> = ({ title }) => {
    return (
        <Grid container direction={'column'} gap={2} sx={{textAlign: 'center', maxWidth:400, margin:'50px auto'}}>
            <Typography variant={'h5'} >
                {title}
            </Typography>
            <Typography variant={'h6'} >
                OOPS. WE’RE WORKING ON IT.
            </Typography>
            <Typography variant={'body1'} >
                Balancing kitchen time with web stuff can be tricky. Please bear with us as we whip up our website and iron out the occasional wrinkles. Your patience is truly appreciated!
            </Typography>
        </Grid>
    );
};

export default NotReady;
