import React from 'react';
import {useLocation} from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import {useObjectActions} from "../ObjectActionsProvider";
import IconButton from "@mui/material/IconButton";
import {styled} from "@mui/material/styles";
import {ChevronLeftOutlined} from "@mui/icons-material";
import OALogo from "./OALogo";
import {useNavDrawer} from "../../NavDrawerProvider";
import FirstVisit from "../components/FirstVisit";
import OaMenu from "./OaMenu";

const DrawerHeader = styled('div')(({theme}) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 1, 1),
    justifyContent: 'space-between',
}));

const OaDrawer = () => {

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
                <OaMenu handleClick={() => handleClick()} />
            </Drawer>
        </React.Fragment>


    );
};

export default OaDrawer;
