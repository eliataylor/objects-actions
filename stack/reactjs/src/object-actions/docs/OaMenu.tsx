import React from 'react';
import {Box, FormHelperText, List, ListItemButton, ListItemIcon, ListItemText, MenuItem} from '@mui/material';
import ThemeSwitcher from "../../theme/ThemeSwitcher";
import {Link, useLocation} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import {useObjectActions} from "../ObjectActionsProvider";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import {styled} from "@mui/material/styles";
import {ChevronLeftOutlined, LocalLibrary} from "@mui/icons-material";
import InstallIcon from "@mui/icons-material/Download";
import CustomizeIcon from "@mui/icons-material/Build";
import ExtendIcon from "@mui/icons-material/Extension";
import ContributeIcon from "@mui/icons-material/VolunteerActivism";
import SponsorIcon from "@mui/icons-material/MonetizationOn";
import SourceIcon from "@mui/icons-material/Code";
import OALogo from "./OALogo";
import {useNavDrawer} from "../../NavDrawerProvider";
import FirstVisit from "../components/FirstVisit";

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 1, 1),
    justifyContent: 'space-between',
}));

const OaMenu = () => {

    const location = useLocation()
    const {navOADrawerWidth, setNavOADrawerWidth, accessDefault, setAccessDefault} = useObjectActions()
    const {setNavDrawerWidth} = useNavDrawer()

    function closeMenu() {
        setNavOADrawerWidth(0)
        setNavDrawerWidth(0)
    }

    function handleClick() {
        setNavDrawerWidth(0)
    }

    return (
        <React.Fragment>
            <FirstVisit/>
            <Drawer
                open={navOADrawerWidth > 0}
                onClose={closeMenu}
                sx={{
                    '& .MuiDrawer-paper': {boxSizing: 'border-box', width: navOADrawerWidth},
                }}
            >
                <DrawerHeader>
                    <IconButton aria-label={'Close OA Drawer'} onClick={() => closeMenu()}>
                        <ChevronLeftOutlined/>
                    </IconButton>
                    <OALogo height={45}/>
                </DrawerHeader>
                <Box sx={{padding: 1}}>

                    <List id={"OaMenu"}>

                        <ListItemButton component={Link} to={'/oa/readme'}
                                        selected={location.pathname === '/oa/readme'}
                                        onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <LocalLibrary/>
                            </ListItemIcon>
                            <ListItemText primary={"About O/A"}/>
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/oa/install"
                            selected={location.pathname === "/oa/install"}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <InstallIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Install"/>
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/oa/customize"
                            selected={location.pathname === "/oa/customize"}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <CustomizeIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Customize"/>
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/oa/extend"
                            selected={location.pathname === "/oa/extend"}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <ExtendIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Extend"/>
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/oa/contribute"
                            selected={location.pathname === "/oa/contribute"}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <ContributeIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Contribute"/>
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/oa/sponsor"
                            selected={location.pathname === "/oa/sponsor"}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <SponsorIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Sponsor"/>
                        </ListItemButton>

                        <ListItemButton
                            component={Link}
                            to="/oa/source"
                            selected={location.pathname === "/oa/source"}
                            onClick={() => handleClick()}
                        >
                            <ListItemIcon>
                                <SourceIcon/>
                            </ListItemIcon>
                            <ListItemText primary="Open Source"/>
                        </ListItemButton>

                        <FormControl sx={{marginTop: 3, marginBottom: 3}} variant={'filled'} fullWidth={true}
                                     size={"small"}>
                            <InputLabel id="defaultperms-label">Default Permission</InputLabel>
                            <Select
                                labelId="defaultperms-label"
                                id="defaultperms"
                                color={'secondary'}
                                fullWidth={true}
                                value={accessDefault}
                                onChange={(e) => setAccessDefault(e.target.value)}
                            >
                                <MenuItem value={'AllowAny'}>
                                    Allow Any
                                </MenuItem>
                                <MenuItem value={'IsAuthenticated'}>
                                    Allow all for Authenticated
                                </MenuItem>
                                <MenuItem value={'IsAuthenticatedOrReadOnly'}>
                                    Is Authenticated or Read only
                                </MenuItem>
                            </Select>
                            <FormHelperText>Default permission for Actions NOT matched in your matrix
                                spreadsheet</FormHelperText>
                        </FormControl>

                    </List>

                    <Box p={1}>
                        <ThemeSwitcher/>
                    </Box>

                </Box>
            </Drawer>
        </React.Fragment>


    );
};

export default OaMenu;
