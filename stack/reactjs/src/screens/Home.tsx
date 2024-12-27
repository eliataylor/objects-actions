import React from 'react';
import {CircularProgress, Grid, Typography} from "@mui/material";
import Logo from "../theme/Logo";

interface HomeProps {
    loading?: boolean;
}

const Home: React.FC<HomeProps> = ({loading = false}) => {

    return (
        <Grid id={"HomeScreen"} container direction={'column'} gap={4} sx={{textAlign: 'center', maxWidth: 400, margin: '70px auto'}}>
            <Grid item>
                <Logo height={120}/>
            </Grid>
            <Grid item>
                <Typography>Object / Actions</Typography>
                {loading && <CircularProgress sx={{height: 100}}/>}
            </Grid>
        </Grid>
    );
};

export default Home;
