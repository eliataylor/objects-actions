import React from 'react';
import {CircularProgress, Divider, Grid, Typography} from "@mui/material";
import {TightButton} from "../theme/StyledFields";
import LightDarkImg from "../components/LightDarkImg";
import {Link} from "react-router-dom";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import OALogo from "../object-actions/docs/OALogo";
import Logo from "../theme/Logo";
import {useObjectActions} from "../object-actions/ObjectActionsProvider";

interface HomeProps {
    loading?: boolean;
}

const Home: React.FC<HomeProps> = ({loading = false}) => {

    const {setNavOADrawerWidth} = useObjectActions()

    return (
        <Grid id={"HomeScreen"} container direction={'column'} gap={4} justifyContent={'space-between'}
              sx={{textAlign: 'center', maxWidth: 400, margin: '70px auto', minHeight: '70vh'}}>

            <Grid item>
                <Typography variant="h4" style={{fontWeight: 100}}>Your Brand Name</Typography>
                <Grid sx={{width: 300, margin: 'auto', marginTop: 3}}>
                    <Logo height={120}/>
                </Grid>
            </Grid>

            <Divider/>

            {loading && <Grid item><CircularProgress sx={{height: 100}}/></Grid>}

            <Grid container wrap={'nowrap'} justifyContent={'space-between'} alignContent={'center'} gap={2}>
                <Grid item>
                    <OALogo height={80}/>
                </Grid>
                <Grid item style={{textAlign: 'left'}}>
                    <Typography variant="h3">Objects / Actions</Typography>
                    <Typography variant="h1">From Spreadsheets to Full Stack</Typography>
                    <Link to={'/oa/readme'}>
                        <TightButton
                            onClick={() => setNavOADrawerWidth(180)}
                            style={{marginTop: 20}} startIcon={<LocalLibraryIcon/>} color={'primary'} size={'small'}
                            variant={'contained'}>Documentation</TightButton>
                    </Link>
                </Grid>
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
