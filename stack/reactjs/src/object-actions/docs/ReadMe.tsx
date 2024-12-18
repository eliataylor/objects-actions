import React from 'react';
import {Container, Grid, List, ListItem, ListItemText, Typography} from '@mui/material';
import {CheckBoxOutlined, TrendingFlat} from "@mui/icons-material";
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import CardHeader from "@mui/material/CardHeader";
import Avatar from "@mui/material/Avatar";

const ReadMe: React.FC = () => {
    return (
        <>
            <Container maxWidth="md">
                <Typography variant="h6">
                    GOALS
                </Typography>
                <List dense={true}>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Learn Relational Database Schema Design"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Quickly build idea App & API prototypes"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Scaffold Content Management Systems"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Scaffold Authentication and Access Permissions"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Scaffold Web App interface and API connectivity"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Scaffold Cypress.io test suites"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <CheckBoxOutlined style={{marginRight: 5}}/>
                        <ListItemText primary={"Generate unlimited fake data to test and prototype"}/>
                    </ListItem>
                </List>

            </Container>

            <Container maxWidth="md">
                <Typography variant="h6">
                    HOW TO WORKS
                </Typography>
                <List dense={true}>
                    {/* <ListItem sx={{p: 0}}>
                        <TrendingFlat style={{marginRight:5}}/>
                        <ListItemText primary={"Defined your project's content as Objects, and the Actions that effect them"}/>
                    </ListItem> */}
                    <ListItem sx={{p: 0}}>
                        <TrendingFlat style={{marginRight: 5}}/>
                        <ListItemText primary={"Define the fields for each Object type"}/>
                    </ListItem>
                    <ListItem sx={{p: 0}}>
                        <TrendingFlat style={{marginRight: 5}}/>
                        <ListItemText primary={"Define the roles and permissions for each Action per Object"}/>
                    </ListItem>
                </List>

                <Grid container spacing={1} wrap={'nowrap'}>
                    {/* <Grid item>
                        <img style={{width:'100%'}} src={"https://github.com/eliataylor/object-actions/raw/main/docs/images/object-actions-nod.png"} />
                    </Grid>
                    */}
                    <Grid item>
                        <img style={{width: '100%'}}
                             src={"https://github.com/eliataylor/object-actions/raw/main/docs/images/objects-nod.png"}/>
                    </Grid>
                    <Grid item>
                        <img style={{width: '100%'}}
                             src={"https://github.com/eliataylor/object-actions/raw/main/docs/images/permissions-matrix-nod.png"}/>
                    </Grid>
                </Grid>

                <Grid container justifyContent={'center'}>
                    <ArrowCircleDownIcon/>
                </Grid>

                <Grid container justifyContent={'center'}>
                    <p>Run the the <a href={"#install"}>install</a> commands to generate this whole stack:</p>
                </Grid>

                <Grid container spacing={1} justifyContent={'space-between'} alignContent={'flex-start'} alignItems={'flex-start'}>
                    <Grid item xs={12} sm={6}>
                        <CardHeader sx={{mb: 1, p: 0}}
                                    avatar={<Avatar src={'/logo-cypress.jpg'}/>}
                                    subheader={'Front-End Test Suite'}
                                    title={'Cypress.io'}
                        />
                        <video style={{width: '100%'}}
                               src={"/cypress-demo.mp4"} autoPlay={true} muted={true} playsInline={true}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <CardHeader sx={{mb: 1, p: 0}}
                                    avatar={<Avatar src={'/logo-drf.jpg'}/>}
                                    subheader={'Backend-End CMS'}
                                    title={'Django Admin'}
                        />
                        <img style={{width: '100%'}}
                             src={"https://github.com/eliataylor/object-actions/raw/main/docs/images/nod-backend_admin.png"}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <CardHeader sx={{mb: 1, p: 0}}
                                    avatar={<Avatar src={'/logo-drf.jpg'}/>}
                                    subheader={'Backend-End API'}
                                    title={'Django DRF with Swagger and Redoc Documentation'}
                        />
                        <img style={{width: '100%'}}
                             src={"https://github.com/eliataylor/object-actions/raw/main/docs/images/nod-backend_swagger.png"}/>
                        <img style={{width: '100%'}}
                             src={"https://github.com/eliataylor/object-actions/raw/main/docs/images/nod-backend_redoc.png"}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>

                    </Grid>

                </Grid>


                <Container maxWidth="md">
                    <Typography variant="h6" gutterBottom={true}>
                        TO RUN
                    </Typography>
                    <section>
                        <code>docker-compose up --build</code>
                        <Typography variant="body2">
                            This will install everything inside a Docker container with an example set of OA
                            Spreadsheets
                        </Typography>
                    </section>
                    <section>
                        <code>docker-compose run setup</code>
                        <Typography variant="body2">
                            This will update your entire stack with any changes you make your your OA Spreadsheets
                        </Typography>
                    </section>
                </Container>

            </Container>
        </>
    );
};

export default ReadMe;
