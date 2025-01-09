import React from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { EntityTypes, TypeFieldSchema } from "../../types/types";
import { OAFormProps, useForm } from "../FormProvider";
import { useSnackbar } from "notistack";
import { AlternatingList } from "../../../theme/StyledFields";

export const OAFormMeetings: React.FC<OAFormProps> = ({ original }) => {

  const { renderField, handleSubmit, handleDelete, errors, entity, syncing } = useForm<EntityTypes>();
  const { enqueueSnackbar } = useSnackbar();

  async function saveEntity() {
    handleSubmit().then((entity) => {
      enqueueSnackbar(`${entity._type} saved`);
    }).catch(error => {
      console.error(error);
      enqueueSnackbar("Save failed");
    });
  }

  function deleteEntity() {
    handleDelete().then((msg) => {
      enqueueSnackbar(`${entity._type} saved`);
    }).catch(error => {
      console.error(error);
      enqueueSnackbar("Delete failed");
    });
  }

  return (
    <AlternatingList container gap={4}>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["title"])}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["address"])}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["start"])}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["end"])}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["meeting_type"])}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["rally"])}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["privacy"])}
      </Grid>

      {errors["general"] && <Typography variant={"body1"} color={"error"}>{errors["general"]}</Typography>}

      <Grid container item xs={12} justifyContent="space-between">
        <Button startIcon={syncing ? <CircularProgress color={"inherit"} size={18} /> : null}
                disabled={syncing}
                variant="contained" color="primary" onClick={saveEntity}>
          Save
        </Button>
        {entity.id && entity.id !== "0" && <Button
          startIcon={syncing ? <CircularProgress color={"inherit"} size={18} /> : null}
          disabled={syncing}
          variant="outlined" color="secondary" onClick={deleteEntity}>
          Delete
        </Button>
        }
      </Grid>
    </AlternatingList>
  );

};

export default OAFormMeetings;
