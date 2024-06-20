import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useObjectActions} from '../object-actions/ObjectActionsProvider';
import {Box, Fab} from "@mui/material";
import {Add, Edit} from "@mui/icons-material";

const ApiViewer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {listData, entityData} = useObjectActions();

    const isPathEndingWithNumber = (path: string) => {
        const regex = /\/\d+$/;
        return regex.test(path);
    };

    if (!listData && !entityData) return null;



    return (
        <Box sx={{padding: 2}}>
            {isPathEndingWithNumber(location.pathname) ?
                <React.Fragment>
                    <pre>{JSON.stringify(entityData, null, 2)}</pre>
                    <Fab color="secondary"
                         size="small"
                         sx={{position: 'absolute', right: 20, bottom: 20}}
                         onClick={() => navigate(`/forms${location.pathname}/edit`)}>

                        <Edit/>
                    </Fab>
                </React.Fragment>
                :
                <React.Fragment>
                    <pre>{JSON.stringify(listData, null, 2)}</pre>
                    <Fab color="secondary"
                         size="small"
                         sx={{position: 'absolute', right: 20, bottom: 20}}
                         onClick={() => navigate(`/forms${location.pathname}/0/add`)}>
                        <Add/>
                    </Fab>
                </React.Fragment>

            }

        </Box>
    );
};

export default ApiViewer;
