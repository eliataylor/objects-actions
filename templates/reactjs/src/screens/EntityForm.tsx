import React, {useEffect, useState} from 'react';
import GenericForm from '../object-actions/forms/GenericForm';
import {CircularProgress, Grid, Typography, Box} from '@mui/material';
import {EntityView, parseFormURL, TypeFieldSchema} from '../object-actions/types/types'
import {useLocation, useParams} from "react-router-dom";

const EntityForm = () => {

    const {id} = useParams();
    const [entity, setEntity] = useState<EntityView | null>();
    const [loading, setLoading] = useState(!entity);
    const location = useLocation();

    const target = parseFormURL(location.pathname)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                if (target) {
                    const response = await fetch(`//${process.env.REACT_APP_API_HOST}/api/${target.object}/${target.id}${location.search}`, {
                        headers: {
//                            'Authorization': 'Bearer YOUR_TOKEN_HERE',
                            'Content-Type': 'application/json'
                        }
                    });
                    const result = await response.json();
                    setEntity(result)
                    setLoading(false)
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [id, location.pathname, location.search]);

    if (!target) {
        return <Typography variant={'h6'}>Invalid URL pattern</Typography>
    }
    const fields = Object.values(TypeFieldSchema[target.object])


    if (loading || !entity) {
        return (
            <Grid container justifyContent="center" alignItems="center" style={{height: '100vh'}}>
                <CircularProgress/>
            </Grid>
        );
    }

    return (
        <Box sx={{pt: 4, pl: 3}}>
            <GenericForm
                fields={fields}
                original={entity}
            />
        </Box>

    );
};

export default EntityForm;
