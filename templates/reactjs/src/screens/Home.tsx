import React from 'react';
import {Grid} from "@mui/material";

const Home = () => {
    return (
        <Grid container direction={'column'} gap={4} sx={{textAlign: 'center', maxWidth:400, margin:'70px auto'}}>
            <Grid item>
                Display JSON of api response
            </Grid>
        </Grid>
    );
};

export default Home;
