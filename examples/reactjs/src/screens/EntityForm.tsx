import React, {useEffect, useState} from 'react';
import GenericForm from '../object-actions/forms/GenericForm';
import {Box, CircularProgress, Grid, Typography} from '@mui/material';
import {EntityTypes, NAVITEMS, parseFormURL, TypeFieldSchema} from '../object-actions/types/types'
import {useLocation, useParams} from "react-router-dom";
import ApiClient from "../config/ApiClient";

const EntityForm = () => {

    const {id} = useParams();
    // @ts-ignore
    const [entity, setEntity] = useState<EntityTypes>({id: 0});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();

    const target = parseFormURL(location.pathname)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            if (target) {
                const result = await ApiClient.get(`${process.env.REACT_APP_API_HOST}/api/${target.object}/${target.id}${location.search}`)
                if (result.success && result.data) {
                    setEntity(result.data as EntityTypes)
                    setLoading(false)
                } else {
                    setError(result.error || "Unknown Error");
                    setLoading(false)
                }
            } else {
                setError('Invalid form URL pattern: ' + JSON.stringify(target));
                setLoading(false)
            }
        };

        if (target && target.verb === 'edit') {
            fetchData();
        } else {
            setLoading(false)
        }


    }, [id, location.pathname, location.search]);

    if (!target) {
        return <Typography variant={'h6'}>Invalid URL pattern</Typography>
    }
    const hasUrl = NAVITEMS.find(nav => nav.screen === `/${target.object}`);
    if (!hasUrl) return <Typography>Unknown Type</Typography>

    const fields = Object.values(TypeFieldSchema[hasUrl.type])


    return (
        <Box sx={{pt: 4, pl: 3}}>
            {error.length > 0 ?
                <Grid container justifyContent="center" alignItems="center">
                    <Typography variant='subtitle1'>{error}</Typography>
                </Grid>
                :
                loading ?
                    <Grid container justifyContent="center" alignItems="center">
                        <CircularProgress/>
                    </Grid>
                    :
                    <GenericForm
                        fields={fields}
                        navItem={hasUrl}
                        original={entity}
                    />
            }
        </Box>

    );
};

export default EntityForm;
