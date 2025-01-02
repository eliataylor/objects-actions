import React from 'react';
import {Box, Card, CardHeader, CardMedia, Grid, List, ListItem, ListItemText, Typography} from '@mui/material';
import {CheckBoxOutlined, CheckCircleOutline} from "@mui/icons-material";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import {TightButton} from "../../theme/StyledFields";
import Avatar from "@mui/material/Avatar";
import LightDarkImg from "../../components/LightDarkImg";

const ReadMe: React.FC = () => {

    const mediaHeight = 250

    return (
        <>
            <Box>
                <Grid container spacing={0} sx={{mb: 3, pl: 1, pr:1}}>
                    <Grid item xs={12} container justifyContent={'space-between'} alignItems={'center'} sx={{mb:3}} wrap={'nowrap'}>
                        <Grid item>
                            <Typography variant={'caption'} style={{fontStyle:'italic'}}> Objects/Actions</Typography>
                            <Typography variant="h1">
                                From Spreadsheets to Full Stack
                            </Typography>
                        </Grid>
                        <Grid item>
                            <a href={'https://github.com/eliataylor/objects-actions'}
                               target={'_blank'}>
                                <TightButton size={'small'} variant={'contained'}
                                             startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                                      dark={'/oa-assets/github-mark-white.svg'}
                                                                      styles={{height: 20}}/>}>Open
                                    Source</TightButton>
                            </a>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{m: 0}}>
                            WHY
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <List dense={true} sx={{p: 0, m: 0}}>
                            <ListItem sx={{p: 0}}>
                                <CheckBoxOutlined fontSize={'small'} style={{marginRight: 5, fontSize:16}} />
                                <ListItemText primary={"Document your Idea and Database"}/>
                            </ListItem>

                            <ListItem sx={{p: 0}}>
                                <CheckBoxOutlined fontSize={'small'} style={{marginRight: 5, fontSize:16}} />
                                <ListItemText primary={"Quickly scaffold scalable Apps & APIs. Including:"}/>
                            </ListItem>
                            <ListItem sx={{p: 0, pl: 3.5}}>
                                <CheckCircleOutline style={{marginRight: 5, fontSize:14}} />
                                <ListItemText
                                    primary={"Authentication with Email, SMS, and nearly every social network"}/>
                            </ListItem>
                            <ListItem sx={{p: 0, pl: 3.5}}>
                                <CheckCircleOutline style={{marginRight: 5, fontSize:14}}/>
                                <ListItemText
                                    primary={"Access Controls for User Groups and content ownership context"}/>
                            </ListItem>
                            <ListItem sx={{p: 0, pl: 3.5}}>
                                <CheckCircleOutline style={{marginRight: 5, fontSize:14}}/>
                                <ListItemText primary={"Content Management Systems"}/>
                            </ListItem>
                            <ListItem sx={{p: 0, pl: 3.5}}>
                                <CheckCircleOutline style={{marginRight: 5, fontSize:14}}/>
                                <ListItemText primary={"Web App interface with API connectivity"}/>
                            </ListItem>
                            <ListItem sx={{p: 0, pl: 3.5}}>
                                <CheckCircleOutline style={{marginRight: 5, fontSize:14}}/>
                                <ListItemText
                                    primary={"Complete End-To-End tests for functionality and content permissions"}/>
                            </ListItem>
                            <ListItem sx={{p: 0, pl: 3.5}}>
                                <CheckCircleOutline style={{marginRight: 5, fontSize:14}}/>
                                <ListItemText
                                    primary={"Data generator to create unlimited content data to test and prototype, and the base data for your Cypress tests"}/>
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>

            </Box>

            <Box>
                <Grid container spacing={0} sx={{mb: 1, pl: 4}}>
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{m: 0}}>
                            HOW
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <ListItem sx={{p: 0, m: 0}}>
                            <Avatar style={{marginRight: 8}}><img src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                                                                  height={25}/></Avatar>
                            <ListItemText primary={"Fill out your Objects/Actions worksheets"}
                                          secondary={'This becomes your database schema and clear documentation for your team and contracts.'}/>
                        </ListItem>
                    </Grid>
                </Grid>


                <Grid container spacing={1} >

                    <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                            <CardHeader sx={{mb: 0, p: 1}}
                                        title={'Define your Fields'}
                                        subheader={'for each Object type'}

                            />
                            <CardMedia height={320} component={'img'} alt={'Object Field Types'}
                                       src={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/objects-nod.png"}/>
                            <Box sx={{p: 1}}>
                                <a href={'https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?usp=sharing'}
                                   target={'_blank'}>
                                    <TightButton size={'small'}
                                                 startIcon={<img src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                                                                 height={20}/>}>Clone</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardHeader sx={{mb: 0, p: 1}}
                                        title={'Define your roles and permissions'}
                                        subheader={'for each Action on any Object'}

                            />
                            <CardMedia height={320} component={'img'} alt={'Permission Matrix'}
                                       src={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/permissions-matrix-nod.png"}/>
                            <Box sx={{p: 1}}>
                                <a href={'https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?usp=sharing'}
                                   target={'_blank'}>
                                    <TightButton size={'small'}
                                                 startIcon={<img src={'/oa-assets/Google_Sheets_2020_Logo.svg'}
                                                                 height={20}/>}>Clone</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>

                </Grid>
            </Box>

            <Box p={0} mt={2} mb={2} sx={{textAlign: 'center'}}>
                <ArrowCircleDownIcon/>
                <Typography variant={'body2'}><code>docker-compose up --build</code></Typography>
                <Typography variant={'h6'}>Generates this whole stack:</Typography>
                <ArrowCircleDownIcon/>
            </Box>

            <Box>
                <Grid container spacing={1} justifyContent={'space-between'} alignContent={'flex-start'}
                      alignItems={'flex-start'}>
                    <Grid item xs={12} sm={6}>
                        <Card sx={{position: 'relative'}} variant="outlined">
                            <CardHeader sx={{mb: 0, p: 1}}
                                        avatar={<LightDarkImg light={'/oa-assets/Cypress_Logomark_Dark-Color.svg'}
                                                              dark={'/oa-assets/Cypress_Logomark_White-Color.svg'}
                                                              styles={{height: 30}}/>}
                                        subheader={'Cypress.io'}
                                        title={'Front-End Test Suite'}
                            />
                            <CardMedia sx={{height: mediaHeight, position: 'relative'}}>
                                <video
                                    autoPlay
                                    muted
                                    loop={true}
                                    style={{width: '100%'}}
                                    controls={true}
                                >
                                    <source
                                        src={"/oa-assets/cypress-demo.mp4"}
                                        type="video/mp4"
                                    />
                                </video>
                            </CardMedia>
                            <Box sx={{textAlign: 'right', p: 1, alignContent: 'flex-end'}}>
                                <a href={'https://github.com/eliataylor/objects-actions/blob/main/stack/cypress/cypress/e2e/read-only/load-form.cy.ts#L20'}
                                   target={'_blank'}>
                                    <TightButton size={'small'} variant={'outlined'}
                                                 startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                                          dark={'/oa-assets/github-mark-white.svg'}
                                                                          styles={{height: 20}}/>}>View
                                        Source</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                            <CardHeader sx={{mb: 0, p: 1}}
                                        avatar={<img src={'/oa-assets/logo-django.svg'} height={30}/>}
                                        title={'Backend-End Content Manager'}
                                        subheader={'Django Admin'}
                            />
                            <CardMedia height={mediaHeight} sx={{position: 'relative'}} component={'img'}
                                       alt={'Backend-End API'}
                                       src={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/nod-backend_admin.png"}/>
                            <Box sx={{textAlign: 'right', p: 1, alignContent: 'flex-end'}}>
                                <a href={'https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/admin.py'}
                                   target={'_blank'}>
                                    <TightButton size={'small'} variant={'outlined'}
                                                 startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                                          dark={'/oa-assets/github-mark-white.svg'}
                                                                          styles={{height: 20}}/>}>View
                                        Source</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                            <CardHeader sx={{mb: 0, p: 1}}
                                        avatar={<img src={'/oa-assets/logo-react.svg'} height={30}/>}
                                        title={'Front-End WebApp'}
                                        subheader={'React.JS'}
                            />
                            <CardMedia height={mediaHeight} component={'img'} alt={'Front-End WebApp'}
                                       src={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/nod-oa-interface.png"}/>
                            <Box sx={{textAlign: 'right', p: 1, alignContent: 'flex-end'}}>
                                <a href={'https://github.com/eliataylor/objects-actions/blob/main/stack/reactjs/src/theme/ThemeContext.js'}
                                   target={'_blank'}>
                                    <TightButton size={'small'} variant={'outlined'}
                                                 startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                                          dark={'/oa-assets/github-mark-white.svg'}
                                                                          styles={{height: 20}}/>}>View
                                        Source</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                            <CardHeader sx={{mb: 0, p: 1}}
                                        avatar={<img src={'/oa-assets/logo-drf.png'} height={30}/>}
                                        title={'Backend-End API'}
                                        subheader={'Django DRF'}
                            />
                            <CardMedia height={mediaHeight} component={'img'} alt={'Backend-End API'}
                                       src={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/nod-backend_swagger.png"}/>
                            <Box sx={{textAlign: 'right', p: 1, alignContent: 'flex-end'}}>
                                <a href={'https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_app/urls.py'}
                                   target={'_blank'}>
                                    <TightButton size={'small'} variant={'outlined'}
                                                 startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                                          dark={'/oa-assets/github-mark-white.svg'}
                                                                          styles={{height: 20}}/>}>View
                                        Source</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Card variant="outlined">
                            <CardHeader sx={{mb: 0, p: 1}}
                                        avatar={<img src={'/oa-assets/logo-typescript.svg'} height={30}/>}
                                        title={'Fake Data Generator'}
                                        subheader={'NodeJS'}
                            />
                            <CardMedia height={mediaHeight} component={'img'} alt={'Databuilder'}
                                       src={"https://github.com/eliataylor/objects-actions/raw/main/docs/images/databuilder.png"}/>
                            <Box sx={{textAlign: 'right', p: 1, alignContent: 'flex-end'}}>
                                <a href={'https://github.com/eliataylor/objects-actions/blob/main/stack/databuilder/src/main.ts'}
                                   target={'_blank'}>
                                    <TightButton size={'small'} variant={'outlined'}
                                                 startIcon={<LightDarkImg light={'/oa-assets/github-mark.svg'}
                                                                          dark={'/oa-assets/github-mark-white.svg'}
                                                                          styles={{height: 20}}/>}>View
                                        Source</TightButton>
                                </a>
                            </Box>
                        </Card>
                    </Grid>


                </Grid>

            </Box>
        </>
    );
};

export default ReadMe;
