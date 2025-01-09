import React from 'react';
import { Button, CircularProgress, FormHelperText, Grid, Typography } from "@mui/material";
import { EntityTypes, TypeFieldSchema } from "../types/types";
import { OAFormProps, useForm } from "./FormProvider";
import {useSnackbar} from "notistack";
import { AlternatingList } from "../../theme/StyledFields";


export const OAFormParties: React.FC<OAFormProps> = ({original}) => {

    const {renderField, handleSubmit, handleDelete, errors, entity, syncing} = useForm<EntityTypes>();
    const {enqueueSnackbar} = useSnackbar()

    async function saveEntity() {
        handleSubmit(entity).then((entity) => {
            enqueueSnackbar(`${entity._type} saved`)
        }).catch(error => {
            enqueueSnackbar('Save failed')
        })
    }

    function deleteEntity() {
        handleDelete().then((msg) => {
            enqueueSnackbar(`${entity._type} saved`)
        }).catch(error => {
            enqueueSnackbar('Delete failed')
        })
    }

    return (
        <AlternatingList container spacing={2} >
            <Grid item xs={12} >
                {renderField(TypeFieldSchema['Parties']['name'], 0, {
                    fullWidth: true,
                    variant: 'standard'
                })}
                {errors['name'] && <FormHelperText>{errors['name']}</FormHelperText>}
            </Grid>

            <Grid item xs={12} >
                {renderField(TypeFieldSchema['Parties']['logo'], 0, {
                    fullWidth: true,
                    variant: 'standard'
                })}
                {errors['logo'] && <FormHelperText>{errors['logo']}</FormHelperText>}
            </Grid>

            <Grid item xs={12} >
                {renderField(TypeFieldSchema['Parties']['website'], 0, {
                    fullWidth: true,
                    variant: 'standard'
                })}
                {errors['website'] && <FormHelperText>{errors['website']}</FormHelperText>}
            </Grid>

            {errors['general'] && <Typography variant={'body1'} color={'error'}>{errors['general']}</Typography>}

            <Grid container item xs={12} justifyContent="space-between">
                <Button startIcon={syncing ? <CircularProgress color={'inherit'} size={18}/> : null}
                        disabled={syncing}
                        variant="contained" color="primary" onClick={saveEntity}>
                    Save
                </Button>
                {entity.id && entity.id !== '0' && <Button
                  startIcon={syncing ? <CircularProgress color={'inherit'} size={18}/> : null}
                  disabled={syncing}
                  variant="outlined" color="secondary" onClick={deleteEntity}>
                  Delete
                </Button>
                }
            </Grid>
        </AlternatingList>
    );

};

export default OAFormParties;
