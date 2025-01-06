import React, {useState} from "react";
import {Box, Button, Modal, Typography} from "@mui/material";
import {useObjectActions} from "../ObjectActionsProvider";
import {Link, useNavigate} from "react-router-dom";

const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

const FirstVisit: React.FC = () => {
    const [isFirstVisit, setIsFirstVisit] = useState(sessionStorage.getItem("firstVisit"));
    const {setNavOADrawerWidth} = useObjectActions()
    const navigate = useNavigate();


    const handleClose = (dest: string = '/oa/readme') => {
        setNavOADrawerWidth(180) // open oa menu
        setIsFirstVisit('false'); // close now
        sessionStorage.setItem("firstVisit", "false"); // Set "firstVisit" to prevent modal from reappearing
        navigate(dest) // navigate
    };

    if (isFirstVisit === 'false') return null;

    return (
        <Modal
            open={true}
            onClose={() => handleClose('/oa/readme')}
            aria-labelledby="first-visit-modal-title"
            aria-describedby="first-visit-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography variant={'body1'} style={{lineHeight: 1.6}}>All contents, structure, and
                    styles of this site
                    are meant to be rebuilt using
                    Objects/Actions with your own customized <Link onClick={() => handleClose('/oa/readme')}
                                                                   to={'/'}>Spreadsheets</Link>.</Typography>

                <Box mt={2}>
                    <Typography variant={'body2'}
                                style={{lineHeight: 1.6}}>
                        The sample data and menus preloaded here were built from
                        demo spreadsheets describing an example platform for organizing
                        rallies and meetings for collaborating on civic engagement action plans.</Typography>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleClose('/oa/readme')}
                    sx={{mt: 3}}
                >
                    Get Started
                </Button>
            </Box>
        </Modal>
    );
};

export default FirstVisit;
