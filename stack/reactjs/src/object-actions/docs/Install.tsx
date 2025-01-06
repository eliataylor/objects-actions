import React from 'react';
import {Box, Typography} from '@mui/material';

const Install: React.FC = () => {

    return (
        <Box>
            <Typography variant={'h2'}>Install</Typography>

            <code>git clone git@github.com:eliataylor/object-actions.git</code>
            <small>or if get SSL errors use
                <code>git clone https://github.com/eliataylor/objects-actions.git</code>
            </small>
            <code>cd object-actions</code>
            <code>docker-compose up --build</code>

        </Box>
    );
};

export default Install;
