import React from 'react';
import {CircularProgress, Grid, Typography} from "@mui/material";
import Logo from "../theme/Logo";
import {TightButton} from "../theme/StyledFields";
import LightDarkImg from "../components/LightDarkImg";
import {Link} from "react-router-dom";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

interface HomeProps {
    loading?: boolean;
}

const Home: React.FC<HomeProps> = ({loading = false}) => {

    return (
        <Grid id={"HomeScreen"} container direction={'column'} gap={4} justifyContent={'space-between'}
              sx={{textAlign: 'center', maxWidth: 400, margin: '70px auto', minHeight: '70vh'}}>
            <Grid item>
                <Typography variant="h4" style={{fontWeight: 100}}>Objects / Actions</Typography>
            </Grid>
            <Grid item>
                <Logo height={120}/>
            </Grid>

            {loading && <Grid item><CircularProgress sx={{height: 100}}/></Grid>}

            <Grid item>
                <Typography variant="h1">
                    From Spreadsheets to Full Stack
                </Typography>
            </Grid>
            <Grid item>
                <Link to={'/readme'}>
                    <TightButton startIcon={<LocalLibraryIcon/>} color={'primary'} size={'small'}
                                 variant={'contained'}>Documentation</TightButton>
                </Link>
            </Grid>

            <a href={'https://github.com/eliataylor/objects-actions'}
               target={'_blank'}>
                <TightButton size={'small'} sx={{position: 'fixed', right: 20, bottom: 20}}
                             startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                      dark={'/oa-assets/github-mark-white.svg'}
                                                      styles={{height: 20}}/>}>Open
                    Source</TightButton>
            </a>

        </Grid>
    );
};

export default Home;
