import React from "react";
import { Button, CircularProgress, Grid, Typography } from "@mui/material";
import { EntityTypes, TypeFieldSchema } from "../../types/types";
import { OAFormProps, useForm } from "../FormProvider";
import { useSnackbar } from "notistack";
import { AlternatingList } from "../../../theme/StyledFields";
import { useNavigate } from "react-router-dom";

export const OAFormMeetings: React.FC<OAFormProps> = ({ onSuccess }) => {

  const { renderField, handleSubmit, handleDelete, errors, navItem, entity, syncing } = useForm<EntityTypes>();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  async function saveEntity() {
    handleSubmit().then((newentity) => {
      if (onSuccess) {
        onSuccess(newentity)
      } else {
        navigate(`/${navItem.segment}/${newentity.id}`);
      }
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
    <AlternatingList container spacing={4} wrap={'wrap'} p={1}>
      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["title"], 0, {fullWidth:true})}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["address"], 0, {fullWidth:true})}
      </Grid>

      <Grid item xs={6}>
        {renderField(TypeFieldSchema["Meetings"]["start"], 0, {fullWidth:true})}
      </Grid>

      <Grid item xs={6}>
        {renderField(TypeFieldSchema["Meetings"]["end"], 0, {fullWidth:true})}
      </Grid>

      <Grid item xs={12} sm={6}>
        {renderField(TypeFieldSchema["Meetings"]["meeting_type"], 0, {fullWidth:true})}
      </Grid>

      <Grid item xs={12} sm={6}>
        {renderField(TypeFieldSchema["Meetings"]["rally"], 0, {fullWidth:true})}
      </Grid>

      <Grid item xs={12}>
        {renderField(TypeFieldSchema["Meetings"]["privacy"])}
      </Grid>

      {errors["general"] && <Typography variant={"body1"} color={"error"}>{errors["general"]}</Typography>}

      <Grid container item xs={12} justifyContent="space-between">
        <Button startIcon={syncing ? <CircularProgress color={"inherit"} size={18} /> : null}
                disabled={syncing}
                aria-label={"Submit"}
                variant="contained" color="primary" onClick={saveEntity}>
          Save
        </Button>
        {entity.id && entity.id !== "0" ? <Button
          startIcon={syncing ? <CircularProgress color={"inherit"} size={18} /> : null}
          disabled={syncing}
          variant="outlined" color="secondary" onClick={deleteEntity}>
          Delete
        </Button> : null
        }
      </Grid>
    </AlternatingList>
  );

};

export default OAFormMeetings;
