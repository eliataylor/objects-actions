import React from 'react';
import {Grid, Typography} from "@mui/material";

const Home = () => {

    return (
        <Grid container direction={'column'} gap={4} sx={{textAlign: 'center', maxWidth:400, margin:'70px auto'}}>
            <Grid item>
                <Typography>Object Actions ReactJS starter app</Typography>
            </Grid>
        </Grid>
    );
};

export default Home;
